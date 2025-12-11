import React from 'react';
import { ConfigurableLink } from '@openmrs/esm-framework';

export default function SurgeryWorkflowMenuLink() {
  return (
    <ConfigurableLink to="${openmrsSpaBase}/surgery-workflow-new">
      Surgery Workflow
    </ConfigurableLink>
  );
}
