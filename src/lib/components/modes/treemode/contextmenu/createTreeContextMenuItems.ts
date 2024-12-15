import {
  faArrowRightArrowLeft,
  faCaretSquareDown,
  faCaretSquareUp,
  faCheckSquare,
  faClone,
  faCopy,
  faCropAlt,
  faCut,
  faFilter,
  faPaste,
  faPen,
  faPlus,
  faSortAmountDownAlt,
  faSquare,
  faTrashCan
} from '@fortawesome/free-solid-svg-icons'
import {
  canConvert,
  getFocusPath,
  isAfterSelection,
  isInsideSelection,
  isKeySelection,
  isMultiSelection,
  isValueSelection,
  singleItemSelected
} from '$lib/logic/selection'
import type {
  ConvertType,
  DocumentState,
  InsertType,
  JSONSelection,
  ContextMenuItem
} from '$lib/types'
import { initial, isEmpty } from 'lodash-es'
import { getIn } from 'immutable-json-patch'
import { isObject, isObjectOrArray } from '$lib/utils/typeUtils'
import { getEnforceString } from '$lib/logic/documentState'

export default function ({
  json,
  documentState,
  selection,
  readOnly,
  onEditKey,
  onEditValue,
  onToggleEnforceString,
  onCut,
  onCopy,
  onPaste,
  onRemove,
  onDuplicate,
  onExtract,
  onInsertBefore,
  onInsert,
  onConvert,
  onInsertAfter,
  onSort,
  onTransform
}: {
  json: unknown
  documentState: DocumentState | undefined
  selection: JSONSelection | undefined
  readOnly: boolean
  onEditKey: () => void
  onEditValue: () => void
  onToggleEnforceString: () => void
  onCut: (indent: boolean) => void
  onCopy: (indent: boolean) => void
  onPaste: () => void
  onRemove: () => void
  onDuplicate: () => void
  onExtract: () => void
  onInsertBefore: () => void
  onInsert: (type: InsertType) => void
  onConvert: (type: ConvertType) => void
  onInsertAfter: () => void
  onSort: () => void
  onTransform: () => void
}): ContextMenuItem[] {
  const hasJson = json !== undefined
  const hasSelection = !!selection
  const rootSelected = selection ? isEmpty(getFocusPath(selection)) : false
  const focusValue = selection ? getIn(json, getFocusPath(selection)) : undefined
  const editValueText = Array.isArray(focusValue)
    ? '编辑数组'
    : isObject(focusValue)
    ? '编辑对象'
    : '编辑值'

  const hasSelectionContents =
    hasJson &&
    (isMultiSelection(selection) || isKeySelection(selection) || isValueSelection(selection))

  const parent =
    selection && !rootSelected ? getIn(json, initial(getFocusPath(selection))) : undefined

  const canEditKey =
    !readOnly && hasJson && singleItemSelected(selection) && !rootSelected && !Array.isArray(parent)

  const canEditValue =
    !readOnly && hasJson && selection !== undefined && singleItemSelected(selection)
  const canEnforceString = canEditValue && !isObjectOrArray(focusValue)

  const canCut = !readOnly && hasSelectionContents
  const canCopy = hasSelectionContents
  const canPaste = !readOnly && hasSelection
  const canDuplicate = !readOnly && hasJson && hasSelectionContents && !rootSelected // must not be root
  const canExtract =
    !readOnly &&
    hasJson &&
    selection !== undefined &&
    (isMultiSelection(selection) || isValueSelection(selection)) &&
    !rootSelected // must not be root

  const convertMode = hasSelectionContents
  const insertOrConvertText = convertMode ? '转换:' : '插入:'

  const canInsertOrConvertStructure =
    !readOnly &&
    ((isInsideSelection(selection) && Array.isArray(focusValue)) ||
      (isAfterSelection(selection) && Array.isArray(parent)))
  const canInsertOrConvertObject =
    !readOnly && (convertMode ? canConvert(selection) && !isObject(focusValue) : hasSelection)
  const canInsertOrConvertArray =
    !readOnly && (convertMode ? canConvert(selection) && !Array.isArray(focusValue) : hasSelection)
  const canInsertOrConvertValue =
    !readOnly && (convertMode ? canConvert(selection) && isObjectOrArray(focusValue) : hasSelection)

  const enforceString =
    selection !== undefined ? getEnforceString(json, documentState, getFocusPath(selection)) : false

  function handleInsertOrConvert(type: InsertType) {
    if (hasSelectionContents) {
      if (type !== 'structure') {
        onConvert(type)
      }
    } else {
      onInsert(type)
    }
  }

  return [
    {
      type: 'row',
      items: [
        {
          type: 'button',
          onClick: () => onEditKey(),
          icon: faPen,
          text: '编辑键',
          title: '编辑键 (双击编辑该键)',
          disabled: !canEditKey
        },
        {
          type: 'dropdown-button',
          main: {
            type: 'button',
            onClick: () => onEditValue(),
            icon: faPen,
            text: editValueText,
            title: '编辑值 (双击编辑该值)',
            disabled: !canEditValue
          },
          width: '11em',
          items: [
            {
              type: 'button',
              icon: faPen,
              text: editValueText,
              title: '编辑值 (双击编辑该值)',
              onClick: () => onEditValue(),
              disabled: !canEditValue
            },
            {
              type: 'button',
              icon: enforceString ? faCheckSquare : faSquare,
              text: '强制转为字符串',
              title: '数字强制转成字符串',
              onClick: () => onToggleEnforceString(),
              disabled: !canEnforceString
            }
          ]
        }
      ]
    },
    { type: 'separator' },
    {
      type: 'row',
      items: [
        {
          type: 'dropdown-button',
          main: {
            type: 'button',
            onClick: () => onCut(true),
            icon: faCut,
            text: '剪切',
            title: '剪切选择内容，并格式化 (Ctrl+X)',
            disabled: !canCut
          },
          width: '10em',
          items: [
            {
              type: 'button',
              icon: faCut,
              text: '格式化剪切',
              title: '剪切选择内容，并格式化 (Ctrl+X)',
              onClick: () => onCut(true),
              disabled: !canCut
            },
            {
              type: 'button',
              icon: faCut,
              text: '压缩剪切',
              title: '剪切选择内容，去除空格 (Ctrl+Shift+X)',
              onClick: () => onCut(false),
              disabled: !canCut
            }
          ]
        },
        {
          type: 'dropdown-button',
          main: {
            type: 'button',
            onClick: () => onCopy(true),
            icon: faCopy,
            text: '复制',
            title: '复制选择内容，并格式化 (Ctrl+C)',
            disabled: !canCopy
          },
          width: '12em',
          items: [
            {
              type: 'button',
              icon: faCopy,
              text: '格式化复制',
              title: '复制选择内容，并格式化 (Ctrl+C)',
              onClick: () => onCopy(true),
              disabled: !canCopy
            },
            {
              type: 'button',
              icon: faCopy,
              text: '压缩复制',
              title: '复制选择内容，去除空格 (Ctrl+Shift+C)',
              onClick: () => onCopy(false),
              disabled: !canCopy
            }
          ]
        },
        {
          type: 'button',
          onClick: () => onPaste(),
          icon: faPaste,
          text: '粘贴',
          title: '粘贴内容 (Ctrl+V)',
          disabled: !canPaste
        }
      ]
    },
    { type: 'separator' },
    {
      type: 'row',
      items: [
        {
          type: 'column',
          items: [
            {
              type: 'button',
              onClick: () => onDuplicate(),
              icon: faClone,
              text: '复制',
              title: '复制所选内容 (Ctrl+D)',
              disabled: !canDuplicate
            },
            {
              type: 'button',
              onClick: () => onExtract(),
              icon: faCropAlt,
              text: '提取',
              title: '提取所选内容',
              disabled: !canExtract
            },
            {
              type: 'button',
              onClick: () => onSort(),
              icon: faSortAmountDownAlt,
              text: '排序',
              title: '重新排序对象或数组',
              disabled: readOnly || !hasSelectionContents
            },
            {
              type: 'button',
              onClick: () => onTransform(),
              icon: faFilter,
              text: '转换',
              title: '转换对象或数组',
              disabled: readOnly || !hasSelectionContents
            },
            {
              type: 'button',
              onClick: () => onRemove(),
              icon: faTrashCan,
              text: '删除',
              title: '删除所选内容 (Delete)',
              disabled: readOnly || !hasSelectionContents
            }
          ]
        },
        {
          type: 'column',
          items: [
            { type: 'label', text: insertOrConvertText },
            {
              type: 'button',
              onClick: () => handleInsertOrConvert('structure'),
              icon: convertMode ? faArrowRightArrowLeft : faPlus,
              text: '结构体',
              title: insertOrConvertText + ' 结构类似于数组中的第一个元素',
              disabled: !canInsertOrConvertStructure
            },
            {
              type: 'button',
              onClick: () => handleInsertOrConvert('object'),
              icon: convertMode ? faArrowRightArrowLeft : faPlus,
              text: '对象',
              title: insertOrConvertText + ' 结构体',
              disabled: !canInsertOrConvertObject
            },
            {
              type: 'button',
              onClick: () => handleInsertOrConvert('array'),
              icon: convertMode ? faArrowRightArrowLeft : faPlus,
              text: '数组',
              title: insertOrConvertText + ' 数组',
              disabled: !canInsertOrConvertArray
            },
            {
              type: 'button',
              onClick: () => handleInsertOrConvert('value'),
              icon: convertMode ? faArrowRightArrowLeft : faPlus,
              text: '值',
              title: insertOrConvertText + ' 值',
              disabled: !canInsertOrConvertValue
            }
          ]
        }
      ]
    },
    {
      type: 'separator'
    },
    {
      type: 'row',
      items: [
        {
          type: 'button',
          onClick: () => onInsertBefore(),
          icon: faCaretSquareUp,
          text: '在前面插入',
          title: '在选择前面插入或粘贴内容',
          disabled: readOnly || !hasSelectionContents || rootSelected
        },
        {
          type: 'button',
          onClick: () => onInsertAfter(),
          icon: faCaretSquareDown,
          text: '在后面插入',
          title: '在选择后面插入或粘贴内容',
          disabled: readOnly || !hasSelectionContents || rootSelected
        }
      ]
    }
  ]
}
