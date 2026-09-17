/**
 * Pydantic (Python v1 & v2) to TypeScript Interface/Type Converter
 * Pure client-side AST-like parser and code generator.
 */

export interface ConversionOptions {
  /** Generate `interface` (default) or `type` alias */
  outputType?: 'interface' | 'type';
  /** Include `export` keyword before interfaces/types (default: true) */
  exportTypes?: boolean;
  /** Mark fields with default values or Optional as optional `?` (default: true) */
  optionalFieldsWithDefaults?: boolean;
  /** Nullability representation for Optional/None: 'null', 'undefined', or 'both' (default: 'null') */
  nullabilityStrategy?: 'null' | 'undefined' | 'both';
  /** How to output Python Enums: 'enum' (TS enum) or 'union' (string/number union) (default: 'enum') */
  enumFormat?: 'enum' | 'union';
  /** Include JSDoc comments extracted from Python docstrings and Field(description=...) (default: true) */
  includeJSDoc?: boolean;
  /** Use field aliases from Field(alias="...") if present (default: false) */
  useFieldAlias?: boolean;
  /** Date/time representation: 'string' (ISO-8601 string) or 'Date' (default: 'string') */
  dateType?: 'string' | 'Date';
  /** Trailing semicolons in interface fields (default: true) */
  semicolons?: boolean;
}

export interface ParsedField {
  name: string;
  originalTypeStr: string;
  tsType: string;
  isOptional: boolean;
  hasDefault: boolean;
  isExplicitlyRequired?: boolean;
  defaultValue?: string;
  description?: string;
  alias?: string;
  comment?: string;
}

export interface ParsedClass {
  name: string;
  type: 'model' | 'enum' | 'type_alias';
  genericParams: string[];
  baseClasses: string[];
  fields: ParsedField[];
  enumValues: Array<{ key: string; value: string | number }>;
  docstring?: string;
  aliasTarget?: string;
}

export interface ConversionResult {
  code: string;
  classesParsed: number;
  enumsParsed: number;
  typeAliasesParsed: number;
  warnings: string[];
  error?: string;
}

const DEFAULT_OPTIONS: Required<ConversionOptions> = {
  outputType: 'interface',
  exportTypes: true,
  optionalFieldsWithDefaults: true,
  nullabilityStrategy: 'null',
  enumFormat: 'enum',
  includeJSDoc: true,
  useFieldAlias: false,
  dateType: 'string',
  semicolons: true,
};

/**
 * Main conversion function.
 */
export function convertPydanticToTypeScript(
  pythonCode: string,
  userOptions?: ConversionOptions
): ConversionResult {
  const options: Required<ConversionOptions> = { ...DEFAULT_OPTIONS, ...userOptions };
  const warnings: string[] = [];

  if (!pythonCode || !pythonCode.trim()) {
    return {
      code: '',
      classesParsed: 0,
      enumsParsed: 0,
      typeAliasesParsed: 0,
      warnings: [],
    };
  }

  try {
    const lines = pythonCode.split(/\r?\n/);
    const parsedItems: ParsedClass[] = [];
    let i = 0;

    while (i < lines.length) {
      const line = lines[i];
      const trimmed = line.trim();

      // Skip blank lines & imports
      if (
        !trimmed ||
        trimmed.startsWith('import ') ||
        trimmed.startsWith('from ') ||
        trimmed.startsWith('pass')
      ) {
        i++;
        continue;
      }

      // Check for Standalone Type Alias: e.g. `UserId = str` or `UserId = Annotated[str, ...]`
      const aliasMatch = trimmed.match(/^([a-zA-Z_][a-zA-Z0-9_]*)\s*:\s*TypeAlias\s*=\s*(.+)$/) ||
                         trimmed.match(/^([A-Z][a-zA-Z0-9_]*)\s*=\s*(Union\[.+\]|Optional\[.+\]|List\[.+\]|Dict\[.+\]|Tuple\[.+\]|Annotated\[.+\]|Literal\[.+\]|[a-zA-Z_][a-zA-Z0-9_\[\],\s|]*)$/);

      if (aliasMatch && !trimmed.startsWith('class ') && !trimmed.startsWith('def ')) {
        const aliasName = aliasMatch[1];
        const rawType = aliasMatch[2].trim();
        // Ignore if it's model_config = ConfigDict(...) or simple variable assignment
        if (aliasName !== 'model_config' && !rawType.startsWith('ConfigDict') && !rawType.startsWith('Field(')) {
          const tsType = parsePythonType(rawType, options);
          parsedItems.push({
            name: aliasName,
            type: 'type_alias',
            genericParams: [],
            baseClasses: [],
            fields: [],
            enumValues: [],
            aliasTarget: tsType,
          });
          i++;
          continue;
        }
      }

      // Check for Class Definition
      const classMatch = trimmed.match(/^class\s+([a-zA-Z_][a-zA-Z0-9_]*)(?:\s*\((.*?)\))?\s*:/);
      if (classMatch) {
        const className = classMatch[1];
        const rawBases = classMatch[2] ? classMatch[2].split(',').map(s => s.trim()).filter(Boolean) : [];

        // Check if class is an Enum
        const isEnum = rawBases.some(b => 
          b === 'Enum' || b === 'IntEnum' || b === 'StrEnum' || b === 'str, Enum' || b === 'int, Enum'
        );

        // Extract generic parameters e.g., Generic[T, U]
        const genericParams: string[] = [];
        const baseClasses: string[] = [];

        for (const base of rawBases) {
          const genericMatch = base.match(/^Generic\[(.*)\]$/);
          if (genericMatch) {
            genericParams.push(...genericMatch[1].split(',').map(s => s.trim()));
          } else if (
            base !== 'BaseModel' &&
            base !== 'object' &&
            base !== 'Enum' &&
            base !== 'IntEnum' &&
            base !== 'StrEnum' &&
            base !== 'str' &&
            base !== 'int' &&
            !base.startsWith('Generic[')
          ) {
            baseClasses.push(base);
          }
        }

        // Parse Class Body
        i++;
        let docstring: string | undefined;
        const fields: ParsedField[] = [];
        const enumValues: Array<{ key: string; value: string | number }> = [];

        // Check for immediate docstring
        if (i < lines.length) {
          const nextTrimmed = lines[i].trim();
          if (nextTrimmed.startsWith('"""') || nextTrimmed.startsWith("'''")) {
            const quote = nextTrimmed.substring(0, 3);
            if (nextTrimmed.endsWith(quote) && nextTrimmed.length > 3) {
              docstring = nextTrimmed.slice(3, -3).trim();
              i++;
            } else {
              const docLines: string[] = [nextTrimmed.slice(3)];
              i++;
              while (i < lines.length) {
                if (lines[i].includes(quote)) {
                  docLines.push(lines[i].split(quote)[0]);
                  i++;
                  break;
                }
                docLines.push(lines[i]);
                i++;
              }
              docstring = docLines.join('\n').trim();
            }
          }
        }

        // Read class block lines (indented)
        while (i < lines.length) {
          const bodyLine = lines[i];
          // Empty lines within class are allowed
          if (!bodyLine.trim()) {
            i++;
            continue;
          }

          // Check if indentation ended (not starting with space/tab and not empty)
          const indentMatch = bodyLine.match(/^(\s+)/);
          if (!indentMatch) {
            // Reached end of class block
            break;
          }

          const lineContent = bodyLine.trim();

          // Skip comments, pass, inner Config class, model_config, methods, decorators
          if (
            lineContent.startsWith('#') ||
            lineContent === 'pass' ||
            lineContent.startsWith('def ') ||
            lineContent.startsWith('@') ||
            lineContent.startsWith('class Config:') ||
            lineContent.startsWith('model_config =')
          ) {
            // If inner Config class or method, skip its entire indented sub-block
            if (lineContent.startsWith('def ') || lineContent.startsWith('class Config:')) {
              const subIndent = indentMatch[1].length;
              i++;
              while (i < lines.length) {
                const subLine = lines[i];
                if (!subLine.trim()) {
                  i++;
                  continue;
                }
                const subLineIndent = (subLine.match(/^(\s+)/) || [''])[0].length;
                if (subLineIndent <= subIndent) {
                  break;
                }
                i++;
              }
              continue;
            }
            i++;
            continue;
          }

          if (isEnum) {
            // Enum member: KEY = "VALUE" or KEY = 1
            const enumMatch = lineContent.match(/^([a-zA-Z_][a-zA-Z0-9_]*)\s*=\s*(.+)$/);
            if (enumMatch) {
              const key = enumMatch[1];
              let valRaw = enumMatch[2].split('#')[0].trim();
              let val: string | number = valRaw;

              // Parse string or number value
              if ((valRaw.startsWith('"') && valRaw.endsWith('"')) || (valRaw.startsWith("'") && valRaw.endsWith("'"))) {
                val = valRaw.slice(1, -1);
              } else if (!isNaN(Number(valRaw))) {
                val = Number(valRaw);
              }
              enumValues.push({ key, value: val });
            }
          } else {
            // Pydantic Model Field
            const parsedField = parseModelField(lineContent, options);
            if (parsedField) {
              fields.push(parsedField);
            }
          }

          i++;
        }

        parsedItems.push({
          name: className,
          type: isEnum ? 'enum' : 'model',
          genericParams,
          baseClasses,
          fields,
          enumValues,
          docstring,
        });

        continue;
      }

      i++;
    }

    // Generate TypeScript Code
    const outputCode = generateTypeScriptCode(parsedItems, options);

    const classesParsed = parsedItems.filter(p => p.type === 'model').length;
    const enumsParsed = parsedItems.filter(p => p.type === 'enum').length;
    const typeAliasesParsed = parsedItems.filter(p => p.type === 'type_alias').length;

    return {
      code: outputCode,
      classesParsed,
      enumsParsed,
      typeAliasesParsed,
      warnings,
    };
  } catch (err: unknown) {
    const errorMessage = err instanceof Error ? err.message : String(err);
    return {
      code: `// Error parsing Pydantic models:\n// ${errorMessage}`,
      classesParsed: 0,
      enumsParsed: 0,
      typeAliasesParsed: 0,
      warnings: [],
      error: errorMessage,
    };
  }
}

/**
 * Parse an individual line inside a Pydantic model.
 */
function parseModelField(line: string, options: Required<ConversionOptions>): ParsedField | null {
  // Extract trailing comment if present
  let inlineComment: string | undefined;
  let cleanLine = line;

  // Be careful with quotes when splitting comments
  const commentIndex = findCommentIndex(line);
  if (commentIndex !== -1) {
    inlineComment = line.substring(commentIndex + 1).trim();
    cleanLine = line.substring(0, commentIndex).trim();
  }

  // Pattern: field_name: Type = Default or field_name: Type
  // Handles names with underscores or leading characters
  const colonIndex = cleanLine.indexOf(':');
  if (colonIndex === -1) return null;

  const name = cleanLine.substring(0, colonIndex).trim();
  if (!name || name.startsWith('def ') || name === 'class') return null;

  const rest = cleanLine.substring(colonIndex + 1).trim();

  // Separate Type Annotation and Default Value / Field(...)
  let typePart = rest;
  let defaultPart: string | undefined;
  let hasDefault = false;

  // Split by first `=` outside of nested brackets `[]` or `()`
  const eqIndex = findAssignmentIndex(rest);
  if (eqIndex !== -1) {
    typePart = rest.substring(0, eqIndex).trim();
    defaultPart = rest.substring(eqIndex + 1).trim();
    hasDefault = true;
  }

  let description: string | undefined;
  let alias: string | undefined;
  let isExplicitlyRequired = false;

  // Parse Field(...) in defaultPart or typePart (Annotated[T, Field(...)])
  if (defaultPart && defaultPart.startsWith('Field(')) {
    const fieldMetadata = extractFieldMetadata(defaultPart);
    description = fieldMetadata.description;
    alias = fieldMetadata.alias;
    if (fieldMetadata.hasDefaultValue !== undefined) {
      hasDefault = fieldMetadata.hasDefaultValue;
    }
    if (fieldMetadata.isExplicitlyRequired !== undefined) {
      isExplicitlyRequired = fieldMetadata.isExplicitlyRequired;
    }
  }

  // Handle Annotated[T, Field(...)]
  if (typePart.startsWith('Annotated[')) {
    const annotatedMeta = extractAnnotatedMetadata(typePart);
    typePart = annotatedMeta.innerType;
    if (annotatedMeta.description) description = annotatedMeta.description;
    if (annotatedMeta.alias) alias = annotatedMeta.alias;
    if (annotatedMeta.hasDefaultValue !== undefined) {
      hasDefault = annotatedMeta.hasDefaultValue;
    }
    if (annotatedMeta.isExplicitlyRequired !== undefined) {
      isExplicitlyRequired = annotatedMeta.isExplicitlyRequired;
    }
  }

  // Convert Python type string to TypeScript
  const tsType = parsePythonType(typePart, options);

  // Determine if field should be optional in TS (marked with `?`)
  // If explicitly required (e.g. Field(...) with ellipsis), it is NEVER optional, even if type is Optional[T] / T | None.
  const isTypeOptional = isPythonTypeOptional(typePart);
  let isOptional: boolean;
  if (isExplicitlyRequired) {
    isOptional = false;
  } else if (options.optionalFieldsWithDefaults) {
    isOptional = hasDefault || isTypeOptional;
  } else {
    isOptional = isTypeOptional;
  }

  return {
    name,
    originalTypeStr: typePart,
    tsType,
    isOptional,
    hasDefault,
    isExplicitlyRequired,
    defaultValue: defaultPart,
    description,
    alias,
    comment: inlineComment,
  };
}

/**
 * Parses Python type expressions recursively to TypeScript type definitions.
 */
export function parsePythonType(typeStr: string, options: Required<ConversionOptions>): string {
  let s = typeStr.trim();
  if (!s) return 'any';

  // Strip Annotated[T, ...]
  if (s.startsWith('Annotated[')) {
    const inner = extractFirstGenericArgument(s.substring(9));
    return parsePythonType(inner, options);
  }

  // Handle Union syntax: Union[A, B, C] or Python 3.10+ Union syntax: A | B | C
  if (s.startsWith('Union[')) {
    const inner = s.slice(6, -1).trim();
    const args = splitTopLevelCommas(inner);
    const hasNone = args.some(a => a.trim() === 'None' || a.trim() === 'NoneType');
    const filtered = args.filter(a => a.trim() !== 'None' && a.trim() !== 'NoneType');

    const mappedArgs = filtered.map(a => parsePythonType(a, options));
    let unionTs = mappedArgs.join(' | ');

    if (hasNone) {
      if (options.nullabilityStrategy === 'null') {
        unionTs = unionTs ? `${unionTs} | null` : 'null';
      } else if (options.nullabilityStrategy === 'undefined') {
        unionTs = unionTs ? `${unionTs} | undefined` : 'undefined';
      } else {
        unionTs = unionTs ? `${unionTs} | null | undefined` : 'null | undefined';
      }
    }
    return unionTs || 'any';
  }

  // Handle Python 3.10+ pipe union: A | B | None
  if (s.includes('|')) {
    const parts = splitTopLevel(s, '|');
    if (parts.length > 1) {
      const hasNone = parts.some(p => p.trim() === 'None' || p.trim() === 'NoneType');
      const filtered = parts.filter(p => p.trim() !== 'None' && p.trim() !== 'NoneType');

      const mappedParts = filtered.map(p => parsePythonType(p, options));
      let unionTs = mappedParts.join(' | ');

      if (hasNone) {
        if (options.nullabilityStrategy === 'null') {
          unionTs = unionTs ? `${unionTs} | null` : 'null';
        } else if (options.nullabilityStrategy === 'undefined') {
          unionTs = unionTs ? `${unionTs} | undefined` : 'undefined';
        } else {
          unionTs = unionTs ? `${unionTs} | null | undefined` : 'null | undefined';
        }
      }
      return unionTs || 'any';
    }
  }

  // Handle Optional[T]
  if (s.startsWith('Optional[')) {
    const inner = s.slice(9, -1).trim();
    const innerTs = parsePythonType(inner, options);
    if (options.nullabilityStrategy === 'null') {
      return `${innerTs} | null`;
    } else if (options.nullabilityStrategy === 'undefined') {
      return `${innerTs} | undefined`;
    } else {
      return `${innerTs} | null | undefined`;
    }
  }

  // Handle List[T], list[T], Sequence[T], Iterable[T], Set[T], set[T], FrozenSet[T]
  const listMatch = s.match(/^(?:List|list|Sequence|Iterable|Set|set|FrozenSet|frozenset|Collection|MutableSequence)\s*\[(.*)\]$/);
  if (listMatch) {
    const inner = listMatch[1].trim();
    const innerTs = parsePythonType(inner, options);
    // Wrap if inner contains union or complex expression
    if (innerTs.includes('|') || innerTs.includes('&') || innerTs.includes(' ')) {
      return `(${innerTs})[]`;
    }
    return `${innerTs}[]`;
  }

  // Handle Dict[K, V], dict[K, V], Mapping[K, V], MutableMapping[K, V]
  const dictMatch = s.match(/^(?:Dict|dict|Mapping|MutableMapping)\s*\[(.*)\]$/);
  if (dictMatch) {
    const inner = dictMatch[1].trim();
    const args = splitTopLevelCommas(inner);
    const keyType = args[0] ? parsePythonType(args[0], options) : 'string';
    const valType = args[1] ? parsePythonType(args[1], options) : 'any';

    // TS Record keys can only be string | number | symbol
    const safeKeyType = (keyType === 'number' || keyType === 'string') ? keyType : 'string';
    return `Record<${safeKeyType}, ${valType}>`;
  }

  // Handle Tuple[A, B, ...]
  const tupleMatch = s.match(/^(?:Tuple|tuple)\s*\[(.*)\]$/);
  if (tupleMatch) {
    const inner = tupleMatch[1].trim();
    if (inner.endsWith(', ...') || inner.endsWith(',...')) {
      const elemType = inner.replace(/,\s*\.\.\.$/, '').trim();
      const elemTs = parsePythonType(elemType, options);
      return `${elemTs}[]`;
    }
    const args = splitTopLevelCommas(inner);
    const mapped = args.map(a => parsePythonType(a, options));
    return `[${mapped.join(', ')}]`;
  }

  // Handle Literal["a", "b", 1, True]
  const literalMatch = s.match(/^(?:Literal|literal)\s*\[(.*)\]$/);
  if (literalMatch) {
    const inner = literalMatch[1].trim();
    const args = splitTopLevelCommas(inner);
    const mapped = args.map(arg => {
      const a = arg.trim();
      if (a === 'True') return 'true';
      if (a === 'False') return 'false';
      if (a === 'None') return 'null';
      return a; // keeps strings like "admin" or numbers like 404
    });
    return mapped.join(' | ');
  }

  // Basic Python Primitive Type Mapping
  switch (s) {
    case 'str':
    case 'EmailStr':
    case 'HttpUrl':
    case 'AnyHttpUrl':
    case 'AnyUrl':
    case 'SecretStr':
    case 'IPvAnyAddress':
    case 'IPvAnyInterface':
    case 'IPvAnyNetwork':
    case 'IPv4Address':
    case 'IPv6Address':
    case 'UUID':
    case 'UUID1':
    case 'UUID3':
    case 'UUID4':
    case 'UUID5':
    case 'FilePath':
    case 'DirectoryPath':
    case 'Path':
    case 'Pattern':
    case 'NameEmail':
      return 'string';

    case 'int':
    case 'float':
    case 'Decimal':
    case 'PositiveInt':
    case 'NegativeInt':
    case 'NonNegativeInt':
    case 'NonPositiveInt':
    case 'PositiveFloat':
    case 'NegativeFloat':
    case 'NonNegativeFloat':
    case 'StrictInt':
    case 'StrictFloat':
    case 'conint':
    case 'confloat':
    case 'condecimal':
      return 'number';

    case 'bool':
    case 'StrictBool':
      return 'boolean';

    case 'datetime':
    case 'date':
    case 'time':
    case 'timedelta':
      return options.dateType === 'Date' ? 'Date' : 'string';

    case 'bytes':
    case 'bytearray':
    case 'SecretBytes':
      return 'string';

    case 'Any':
    case 'object':
    case 'Json':
    case 'JsonValue':
      return 'any';

    case 'None':
    case 'NoneType':
      return options.nullabilityStrategy === 'undefined' ? 'undefined' : 'null';

    default:
      // Handle constrained types like conint(gt=0), constr(min_length=1)
      if (s.startsWith('conint(') || s.startsWith('confloat(') || s.startsWith('condecimal(')) {
        return 'number';
      }
      if (s.startsWith('constr(') || s.startsWith('constr (')) {
        return 'string';
      }
      if (s.startsWith('conlist(')) {
        return 'any[]';
      }
      if (s.startsWith('condict(')) {
        return 'Record<string, any>';
      }

      // Handle custom generics e.g. Response[User]
      const customGenericMatch = s.match(/^([a-zA-Z_][a-zA-Z0-9_]*)\s*\[(.*)\]$/);
      if (customGenericMatch) {
        const outer = customGenericMatch[1];
        const innerArgs = splitTopLevelCommas(customGenericMatch[2]);
        const mappedArgs = innerArgs.map(a => parsePythonType(a, options));
        return `${outer}<${mappedArgs.join(', ')}>`;
      }

      // Custom identifier (e.g. User, OrderStatus, Address)
      return s;
  }
}

/**
 * Check if Python type expression represents an optional/nullable type.
 */
function isPythonTypeOptional(typeStr: string): boolean {
  const s = typeStr.trim();
  if (s.startsWith('Optional[')) return true;
  if (s.includes('|')) {
    const parts = splitTopLevel(s, '|');
    return parts.some(p => p.trim() === 'None' || p.trim() === 'NoneType');
  }
  if (s.startsWith('Union[')) {
    const inner = s.slice(6, -1);
    const args = splitTopLevelCommas(inner);
    return args.some(a => a.trim() === 'None' || a.trim() === 'NoneType');
  }
  return false;
}

/**
 * Extracts metadata from a `Field(...)` call.
 */
function extractFieldMetadata(fieldCallStr: string): {
  description?: string;
  alias?: string;
  hasDefaultValue?: boolean;
  isExplicitlyRequired?: boolean;
} {
  const result: {
    description?: string;
    alias?: string;
    hasDefaultValue?: boolean;
    isExplicitlyRequired?: boolean;
  } = {};

  // Extract description="..." or description='...'
  const descMatch = fieldCallStr.match(/description\s*=\s*(?:"([^"\\]*(?:\\.[^"\\]*)*)"|'([^'\\]*(?:\\.[^'\\]*)*)')/);
  if (descMatch) {
    result.description = descMatch[1] ?? descMatch[2];
  }

  // Extract alias="..." or alias='...' or validation_alias="..."
  const aliasMatch = fieldCallStr.match(/(?:validation_alias|serialization_alias|alias)\s*=\s*(?:"([^"\\]*(?:\\.[^"\\]*)*)"|'([^'\\]*(?:\\.[^'\\]*)*)')/);
  if (aliasMatch) {
    result.alias = aliasMatch[1] ?? aliasMatch[2];
  }

  // Check default value:
  // If starts with Field(..., it is required with ellipsis `...`
  // If starts with Field(default=... or Field(default_factory=... or has positional first arg that is not `...`
  const inner = fieldCallStr.slice(6, -1).trim();
  if (
    inner === '...' ||
    inner.startsWith('...,') ||
    inner.startsWith('... ,') ||
    inner.startsWith('...') ||
    inner === 'Ellipsis' ||
    inner.startsWith('Ellipsis,') ||
    inner.startsWith('Ellipsis ,') ||
    inner.startsWith('Ellipsis')
  ) {
    result.hasDefaultValue = false;
    result.isExplicitlyRequired = true;
  } else if (inner.startsWith('default=') || inner.startsWith('default_factory=')) {
    result.hasDefaultValue = true;
    result.isExplicitlyRequired = false;
  } else if (
    inner.length > 0 &&
    !inner.startsWith('title=') &&
    !inner.startsWith('description=') &&
    !inner.startsWith('alias=') &&
    !inner.startsWith('validation_alias=') &&
    !inner.startsWith('serialization_alias=') &&
    !inner.startsWith('gt=') &&
    !inner.startsWith('ge=') &&
    !inner.startsWith('lt=') &&
    !inner.startsWith('le=') &&
    !inner.startsWith('min_length=') &&
    !inner.startsWith('max_length=') &&
    !inner.startsWith('pattern=') &&
    !inner.startsWith('regex=')
  ) {
    // Positional default argument (e.g. Field("default_val", description="..."))
    result.hasDefaultValue = true;
    result.isExplicitlyRequired = false;
  } else {
    // Field(description="...") or Field(min_length=1) without default -> explicitly required
    result.hasDefaultValue = false;
    result.isExplicitlyRequired = true;
  }

  return result;
}

/**
 * Extracts metadata from `Annotated[T, Field(...)]`
 */
function extractAnnotatedMetadata(annotatedStr: string): {
  innerType: string;
  description?: string;
  alias?: string;
  hasDefaultValue?: boolean;
  isExplicitlyRequired?: boolean;
} {
  const content = annotatedStr.slice(10, -1).trim();
  const commaIdx = findTopLevelComma(content);
  if (commaIdx === -1) {
    return { innerType: content };
  }

  const innerType = content.substring(0, commaIdx).trim();
  const rest = content.substring(commaIdx + 1).trim();

  const fieldMatch = rest.match(/Field\((.*)\)/);
  if (fieldMatch) {
    const meta = extractFieldMetadata(fieldMatch[0]);
    return {
      innerType,
      ...meta,
    };
  }

  return { innerType };
}

/**
 * Generates the full TypeScript code from parsed classes and types.
 */
function generateTypeScriptCode(items: ParsedClass[], options: Required<ConversionOptions>): string {
  if (items.length === 0) return '';

  const exportPrefix = options.exportTypes ? 'export ' : '';
  const semi = options.semicolons ? ';' : '';
  const blocks: string[] = [];

  for (const item of items) {
    if (item.type === 'type_alias') {
      blocks.push(`${exportPrefix}type ${item.name} = ${item.aliasTarget}${semi}`);
      continue;
    }

    if (item.type === 'enum') {
      if (options.enumFormat === 'enum') {
        const enumLines: string[] = [];
        if (options.includeJSDoc && item.docstring) {
          enumLines.push(formatJSDoc(item.docstring));
        }
        enumLines.push(`${exportPrefix}enum ${item.name} {`);
        for (const val of item.enumValues) {
          const valFormatted = typeof val.value === 'string' ? `"${val.value}"` : val.value;
          enumLines.push(`  ${val.key} = ${valFormatted},`);
        }
        enumLines.push('}');
        blocks.push(enumLines.join('\n'));
      } else {
        // Union format
        const unionVals = item.enumValues.map(v => 
          typeof v.value === 'string' ? `"${v.value}"` : v.value
        ).join(' | ');
        const unionLines: string[] = [];
        if (options.includeJSDoc && item.docstring) {
          unionLines.push(formatJSDoc(item.docstring));
        }
        unionLines.push(`${exportPrefix}type ${item.name} = ${unionVals || 'string'}${semi}`);
        blocks.push(unionLines.join('\n'));
      }
      continue;
    }

    // Pydantic Model -> TS Interface or Type
    const genericClause = item.genericParams.length > 0 ? `<${item.genericParams.join(', ')}>` : '';
    const extendsClause = item.baseClasses.length > 0 ? ` extends ${item.baseClasses.join(', ')}` : '';

    const lines: string[] = [];

    // Class Docstring
    if (options.includeJSDoc && item.docstring) {
      lines.push(formatJSDoc(item.docstring));
    }

    if (options.outputType === 'interface') {
      lines.push(`${exportPrefix}interface ${item.name}${genericClause}${extendsClause} {`);
    } else {
      // Type alias
      const intersection = item.baseClasses.length > 0 ? `${item.baseClasses.join(' & ')} & ` : '';
      lines.push(`${exportPrefix}type ${item.name}${genericClause} = ${intersection}{`);
    }

    // Fields
    for (const field of item.fields) {
      const fieldKey = (options.useFieldAlias && field.alias) ? field.alias : field.name;
      const safeKey = isValidIdentifier(fieldKey) ? fieldKey : `"${fieldKey}"`;
      const optMarker = field.isOptional ? '?' : '';

      // JSDoc comment for field
      if (options.includeJSDoc && (field.description || field.alias || field.comment)) {
        const jsdocParts: string[] = [];
        if (field.description) jsdocParts.push(field.description);
        if (field.comment && field.comment !== field.description) jsdocParts.push(field.comment);
        if (field.alias && !options.useFieldAlias) jsdocParts.push(`@alias ${field.alias}`);

        if (jsdocParts.length === 1 && !jsdocParts[0].includes('\n')) {
          lines.push(`  /** ${jsdocParts[0]} */`);
        } else if (jsdocParts.length > 0) {
          lines.push('  /**');
          for (const p of jsdocParts) {
            const splitted = p.split('\n');
            for (const sp of splitted) {
              lines.push(`   * ${sp}`);
            }
          }
          lines.push('   */');
        }
      }

      lines.push(`  ${safeKey}${optMarker}: ${field.tsType}${semi}`);
    }

    lines.push(options.outputType === 'interface' ? '}' : `}${semi}`);
    blocks.push(lines.join('\n'));
  }

  return blocks.join('\n\n');
}

/**
 * Format string as JSDoc comment block.
 */
function formatJSDoc(text: string): string {
  const lines = text.trim().split('\n');
  if (lines.length === 1) {
    return `/** ${lines[0].trim()} */`;
  }
  const formatted = ['/**'];
  for (const line of lines) {
    formatted.push(` * ${line.trim()}`);
  }
  formatted.push(' */');
  return formatted.join('\n');
}

/**
 * Check if a property key is a valid JavaScript identifier without quotes.
 */
function isValidIdentifier(name: string): boolean {
  return /^[a-zA-Z_$][a-zA-Z0-9_$]*$/.test(name);
}

/**
 * Helpers for tokenizing and splitting expressions respecting brackets.
 */
function findCommentIndex(line: string): number {
  let inSingleQuote = false;
  let inDoubleQuote = false;

  for (let i = 0; i < line.length; i++) {
    const char = line[i];
    if (char === "'" && !inDoubleQuote) inSingleQuote = !inSingleQuote;
    else if (char === '"' && !inSingleQuote) inDoubleQuote = !inDoubleQuote;
    else if (char === '#' && !inSingleQuote && !inDoubleQuote) {
      return i;
    }
  }
  return -1;
}

function findAssignmentIndex(line: string): number {
  let depthBracket = 0;
  let depthParen = 0;
  let inSingleQuote = false;
  let inDoubleQuote = false;

  for (let i = 0; i < line.length; i++) {
    const char = line[i];
    if (char === "'" && !inDoubleQuote) inSingleQuote = !inSingleQuote;
    else if (char === '"' && !inSingleQuote) inDoubleQuote = !inDoubleQuote;
    else if (!inSingleQuote && !inDoubleQuote) {
      if (char === '[') depthBracket++;
      else if (char === ']') depthBracket--;
      else if (char === '(') depthParen++;
      else if (char === ')') depthParen--;
      else if (char === '=' && depthBracket === 0 && depthParen === 0) {
        // Ensure not == or != or <= or >=
        if (line[i + 1] !== '=' && line[i - 1] !== '=' && line[i - 1] !== '!' && line[i - 1] !== '<' && line[i - 1] !== '>') {
          return i;
        }
      }
    }
  }
  return -1;
}

function findTopLevelComma(line: string): number {
  let depthBracket = 0;
  let depthParen = 0;
  let inSingleQuote = false;
  let inDoubleQuote = false;

  for (let i = 0; i < line.length; i++) {
    const char = line[i];
    if (char === "'" && !inDoubleQuote) inSingleQuote = !inSingleQuote;
    else if (char === '"' && !inSingleQuote) inDoubleQuote = !inDoubleQuote;
    else if (!inSingleQuote && !inDoubleQuote) {
      if (char === '[') depthBracket++;
      else if (char === ']') depthBracket--;
      else if (char === '(') depthParen++;
      else if (char === ')') depthParen--;
      else if (char === ',' && depthBracket === 0 && depthParen === 0) {
        return i;
      }
    }
  }
  return -1;
}

function splitTopLevelCommas(str: string): string[] {
  return splitTopLevel(str, ',');
}

function splitTopLevel(str: string, delimiter: string): string[] {
  const result: string[] = [];
  let current = '';
  let depthBracket = 0;
  let depthParen = 0;
  let inSingleQuote = false;
  let inDoubleQuote = false;

  for (let i = 0; i < str.length; i++) {
    const char = str[i];
    if (char === "'" && !inDoubleQuote) inSingleQuote = !inSingleQuote;
    else if (char === '"' && !inSingleQuote) inDoubleQuote = !inDoubleQuote;
    else if (!inSingleQuote && !inDoubleQuote) {
      if (char === '[') depthBracket++;
      else if (char === ']') depthBracket--;
      else if (char === '(') depthParen++;
      else if (char === ')') depthParen--;
      else if (char === delimiter && depthBracket === 0 && depthParen === 0) {
        result.push(current.trim());
        current = '';
        continue;
      }
    }
    current += char;
  }
  if (current.trim()) {
    result.push(current.trim());
  }
  return result;
}

function extractFirstGenericArgument(str: string): string {
  let depthBracket = 0;
  let current = '';
  for (let i = 0; i < str.length; i++) {
    const char = str[i];
    if (char === '[') depthBracket++;
    else if (char === ']') {
      if (depthBracket === 0) break;
      depthBracket--;
    } else if (char === ',' && depthBracket === 0) {
      break;
    }
    current += char;
  }
  return current.trim();
}
