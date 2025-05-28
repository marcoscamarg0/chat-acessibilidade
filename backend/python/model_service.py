from flask import Flask, request, jsonify
import torch
from transformers import AutoModelForCausalLM, AutoTokenizer
from sentence_transformers import SentenceTransformer
import os

app = Flask(__name__)

# Carregar modelo de linguagem pequeno para rodar localmente
print("Carregando modelo de linguagem...")
model_name = "distilgpt2"  # Modelo menor para rodar localmente
tokenizer = AutoTokenizer.from_pretrained(model_name)
model = AutoModelForCausalLM.from_pretrained(model_name)

# Carregar modelo de embeddings para busca semântica
print("Carregando modelo de embeddings...")
embedding_model = SentenceTransformer('paraphrase-MiniLM-L6-v2')  # Modelo leve de embeddings

# Carregar dados de acessibilidade
script_dir = os.path.dirname(os.path.abspath(__file__))
data_dir = os.path.join(os.path.dirname(script_dir), 'data') # Assume que 'data' está um nível acima da pasta 'python'

# Corrigindo o caminho para os arquivos JSON se 'data' estiver no mesmo nível que 'python', dentro de 'backend'
# Se a estrutura é backend/data e backend/python, o data_dir deve ser:
# data_dir = os.path.join(script_dir, '..', 'data')
# No seu caso, parece que data_dir = os.path.join(os.path.dirname(script_dir), 'data') está correto
# se 'backend' é o diretório pai de 'python' e 'data'.
# Ex: project_root/backend/python e project_root/backend/data

faq_file_path = os.path.join(data_dir, 'faq.json')
wcag_rules_file_path = os.path.join(data_dir, 'wcagRules.json')

if not os.path.exists(faq_file_path):
    print(f"ERRO: faq.json não encontrado em {faq_file_path}")
    faq_responses = {}
else:
    with open(faq_file_path, 'r', encoding='utf-8') as f:
        faq_responses = json.load(f)

if not os.path.exists(wcag_rules_file_path):
    print(f"ERRO: wcagRules.json não encontrado em {wcag_rules_file_path}")
    wcag_rules = []
else:
    with open(wcag_rules_file_path, 'r', encoding='utf-8') as f:
        wcag_rules = json.load(f)


# Preparar embeddings para os dados
print("Preparando embeddings para busca semântica...")
faq_texts = list(faq_responses.keys())
faq_embeddings = None
if faq_texts:
    faq_embeddings = embedding_model.encode(faq_texts)

wcag_texts = [f"{rule.get('id', '')} {rule.get('name', '')}" for rule in wcag_rules]
wcag_embeddings = None
if wcag_texts:
    wcag_embeddings = embedding_model.encode(wcag_texts)

@app.route('/generate', methods=['POST'])
def generate():
    data = request.json
    message = data.get('message', '')
    # active_tool = data.get('activeTool', None) # Se você decidir usar activeTool no Python

    if not message:
        return jsonify({"response": "Nenhuma mensagem recebida."})

    query_embedding = embedding_model.encode([message])[0]
    
    best_faq_response = None
    if faq_embeddings is not None and len(faq_texts) > 0:
        faq_similarities = torch.nn.functional.cosine_similarity(
            torch.tensor(query_embedding).unsqueeze(0),
            torch.tensor(faq_embeddings),
            dim=1
        )
        best_faq_idx = torch.argmax(faq_similarities).item()
        best_faq_score = faq_similarities[best_faq_idx].item()
        if best_faq_score > 0.7: # Limiar de similaridade
            best_faq_response = faq_responses[faq_texts[best_faq_idx]]

    best_wcag_response = None
    if wcag_embeddings is not None and len(wcag_rules) > 0:
        wcag_similarities = torch.nn.functional.cosine_similarity(
            torch.tensor(query_embedding).unsqueeze(0),
            torch.tensor(wcag_embeddings),
            dim=1
        )
        best_wcag_idx = torch.argmax(wcag_similarities).item()
        best_wcag_score = wcag_similarities[best_wcag_idx].item()
        if best_wcag_score > 0.7: # Limiar de similaridade
            rule = wcag_rules[best_wcag_idx]
            best_wcag_response = f"**{rule.get('id')}: {rule.get('name')}**\n\n{rule.get('description')}\n\nCritério WCAG: {rule.get('wcag')}"
    
    # Priorizar a resposta mais específica (FAQ ou WCAG) se encontrada
    if best_faq_response and (not best_wcag_response or best_faq_score >= best_wcag_score):
        return jsonify({"response": best_faq_response})
    elif best_wcag_response:
        return jsonify({"response": best_wcag_response})
    
    # Caso contrário, gerar resposta com o modelo de linguagem
    prompt = f"Você é um assistente especializado em acessibilidade web. Responda à seguinte pergunta de forma concisa e útil, considerando o contexto de acessibilidade digital e WCAG:\n\nPergunta: {message}\n\nResposta:"
    
    inputs = tokenizer(prompt, return_tensors="pt", truncation=True, max_length=tokenizer.model_max_length) # Adicionado truncation e max_length
    
    # Ajuste para modelos que podem não ter pad_token_id configurado, como distilgpt2
    if tokenizer.pad_token_id is None:
        tokenizer.pad_token_id = tokenizer.eos_token_id

    outputs = model.generate(
        inputs["input_ids"],
        attention_mask=inputs.get("attention_mask"), # Adicionar attention_mask
        pad_token_id=tokenizer.pad_token_id, # Especificar pad_token_id
        max_length=200, # Aumentar um pouco para respostas mais completas se necessário
        num_return_sequences=1,
        temperature=0.7,
        top_p=0.9,
        do_sample=True,
        eos_token_id=tokenizer.eos_token_id # Parar a geração no token de fim de sentença
    )
    
    response_text = tokenizer.decode(outputs[0], skip_special_tokens=True)
    # Extrair apenas a parte da resposta após "Resposta:"
    if "Resposta:" in response_text:
        response_text = response_text.split("Resposta:")[-1].strip()
    else: # Fallback se o prompt não for perfeitamente replicado
        response_text = response_text.replace(prompt.split("Resposta:")[0], "").strip()

    return jsonify({"response": response_text if response_text else "Não consegui gerar uma resposta específica. Pode reformular sua pergunta?"})

if __name__ == '__main__':
    # Verifica se está rodando em um ambiente com variável de ambiente PORT (comum em produção/contenedores)
    port = int(os.environ.get('PORT', 5001))
    print(f"Serviço do modelo Python iniciado em http://localhost:{port}")
    app.run(host='0.0.0.0', port=port)