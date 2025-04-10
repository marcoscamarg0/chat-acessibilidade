import React, { memo } from 'react';
import PropTypes from 'prop-types';

const SummaryTab = ({ violations, passes, incomplete, inapplicable }) => (
  <div>
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
      {/* ...existing grid items code... */}
    </div>
    
    <div className="mt-4">
      <h4 className="font-bold mb-2">Recomendações Principais:</h4>
      <ul className="list-disc pl-5 space-y-2">
        {violations.slice(0, 3).map((violation) => (
          <li key={violation.id} className="text-sm">
            <span className="text-red-400 font-medium">{violation.impact} - </span>
            {violation.description}
          </li>
        ))}
      </ul>
    </div>
  </div>
);

SummaryTab.propTypes = {
  violations: PropTypes.array.isRequired,
  passes: PropTypes.array.isRequired,
  incomplete: PropTypes.array.isRequired,
  inapplicable: PropTypes.array.isRequired
};

export default memo(SummaryTab);