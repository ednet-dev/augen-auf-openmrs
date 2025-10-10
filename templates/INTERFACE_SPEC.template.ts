/**
 * {{INTERFACE_NAME}} Contract
 * 
 * {{INTERFACE_DESCRIPTION}}
 * 
 * @version {{VERSION}}
 * @status {{STATUS}}
 * @frozen-date {{FROZEN_DATE}}
 * @owner {{OWNER}}
 * @consumers {{CONSUMERS}}
 * 
 * @example
 * ```typescript
 * {{EXAMPLE_USAGE}}
 * ```
 */

export interface {{INTERFACE_NAME}} {
  /**
   * {{METHOD_1_DESCRIPTION}}
   * 
   * @param {{PARAM_1_NAME}} - {{PARAM_1_DESCRIPTION}}
   * @returns {{RETURN_DESCRIPTION}}
   * 
   * @example
   * ```typescript
   * {{METHOD_1_EXAMPLE}}
   * ```
   */
  {{METHOD_1_NAME}}({{PARAM_1_NAME}}: {{PARAM_1_TYPE}}): {{RETURN_TYPE}};

  // Add more methods as needed
}

/**
 * {{TYPE_1_NAME}}
 * 
 * {{TYPE_1_DESCRIPTION}}
 */
export type {{TYPE_1_NAME}} = {{TYPE_1_DEFINITION}};

/**
 * {{CONSTANT_1_NAME}}
 * 
 * {{CONSTANT_1_DESCRIPTION}}
 */
export const {{CONSTANT_1_NAME}} = {{CONSTANT_1_VALUE}};

/**
 * Version history:
 * 
 * v{{VERSION}} ({{VERSION_DATE}}):
 * - {{CHANGE_DESCRIPTION}}
 * 
 * Breaking changes:
 * - {{BREAKING_CHANGE_DESCRIPTION}}
 * 
 * Migration from v{{OLD_VERSION}}:
 * - {{MIGRATION_STEP_1}}
 * - {{MIGRATION_STEP_2}}
 */
