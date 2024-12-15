import type { ContextMenuItem, DocumentState, JSONSelection } from 'svelte-jsoneditor'
import {
  faCheckSquare,
  faClone,
  faCopy,
  faCut,
  faPaste,
  faPen,
  faPlus,
  faSquare,
  faTrashCan
} from '@fortawesome/free-solid-svg-icons'
import { isKeySelection, isMultiSelection, isValueSelection } from '$lib/logic/selection'
import { getIn } from 'immutable-json-patch'
import { getFocusPath, singleItemSelected } from '$lib/logic/selection'
import { isObjectOrArray } from '$lib/utils/typeUtils'
import { getEnforceString } from '$lib/logic/documentState'

export default function ({
  json,
  documentState,
  selection,
  readOnly,
  onEditValue,
  onEditRow,
  onToggleEnforceString,
  onCut,
  onCopy,
  onPaste,
  onRemove,
  onDuplicateRow,
  onInsertBeforeRow,
  onInsertAfterRow,
  onRemoveRow
}: {
  json: unknown | undefined
  documentState: DocumentState | undefined
  selection: JSONSelection | undefined
  readOnly: boolean
  onEditValue: () => void
  onEditRow: () => void
  onToggleEnforceString: () => void
  onCut: (indent: boolean) => void
  onCopy: (indent: boolean) => void
  onPaste: () => void
  onRemove: () => void
  onDuplicateRow: () => void
  onInsertBeforeRow: () => void
  onInsertAfterRow: () => void
  onRemoveRow: () => void
}): ContextMenuItem[] {
  const hasJson = json !== undefined
  const hasSelection = !!selection
  const focusValue =
    json !== undefined && selection ? getIn(json, getFocusPath(selection)) : undefined

  const hasSelectionContents =
    hasJson &&
    (isMultiSelection(selection) || isKeySelection(selection) || isValueSelection(selection))

  const canEditValue =
    !readOnly && hasJson && selection !== undefined && singleItemSelected(selection)
  const canEnforceString = canEditValue && !isObjectOrArray(focusValue)

  const canCut = !readOnly && hasSelectionContents

  const enforceString =
    selection !== undefined ? getEnforceString(json, documentState, getFocusPath(selection)) : false

  return [
    { type: 'separator' },
    {
      type: 'row',
      items: [
        {
          type: 'column',
          items: [
            { type: 'label', text: '表格单元格:' },
            {
              type: 'dropdown-button',
              main: {
                type: 'button',
                onClick: () => onEditValue(),
                icon: faPen,
                text: '编辑',
                title: '编辑值（双击编辑该值）',
                disabled: !canEditValue
              },
              width: '11em',
              items: [
                {
                  type: 'button',
                  icon: faPen,
                  text: 'Edit',
                  title: '编辑值（双击编辑该值）',
                  onClick: () => onEditValue(),
                  disabled: !canEditValue
                },
                {
                  type: 'button',
                  icon: enforceString ? faCheckSquare : faSquare,
                  text: '强制转为字符串',
                  title: '当数值包含数值时，强制将数值转为字符串',
                  onClick: () => onToggleEnforceString(),
                  disabled: !canEnforceString
                }
              ]
            },
            {
              type: 'dropdown-button',
              main: {
                type: 'button',
                onClick: () => onCut(true),
                icon: faCut,
                text: '剪贴',
                title: '剪切选定内容，格式为缩进（Ctrl+X）',
                disabled: !canCut
              },
              width: '10em',
              items: [
                {
                  type: 'button',
                  icon: faCut,
                  text: '剪切并格式化',
                  title: '剪切选定内容，格式为缩进（Ctrl+X）',
                  onClick: () => onCut(true),
                  disabled: readOnly || !hasSelectionContents
                },
                {
                  type: 'button',
                  icon: faCut,
                  text: '剪切并压缩',
                  title: '剪切选中内容，不缩进 (Ctrl+Shift+X)',
                  onClick: () => onCut(false),
                  disabled: readOnly || !hasSelectionContents
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
                title: '复制所选内容，格式为缩进 (Ctrl+C)',
                disabled: !hasSelectionContents
              },
              width: '12em',
              items: [
                {
                  type: 'button',
                  icon: faCopy,
                  text: '复制并格式化',
                  title: '复制所选内容，格式为缩进 (Ctrl+C)',
                  onClick: () => onCopy(false),
                  disabled: !hasSelectionContents
                },
                {
                  type: 'button',
                  icon: faCopy,
                  text: '复制并压缩',
                  title: '复制选定内容，不缩进 (Ctrl+Shift+C)',
                  onClick: () => onCopy(false),
                  disabled: !hasSelectionContents
                }
              ]
            },
            {
              type: 'button',
              onClick: () => onPaste(),
              icon: faPaste,
              text: '粘贴',
              title: '粘贴剪贴板内容 (Ctrl+V)',
              disabled: readOnly || !hasSelection
            },
            {
              type: 'button',
              onClick: () => onRemove(),
              icon: faTrashCan,
              text: '删除',
              title: '删除选定的内容（删除）',
              disabled: readOnly || !hasSelectionContents
            }
          ]
        },
        {
          type: 'column',
          items: [
            { type: 'label', text: '表格行:' },
            {
              type: 'button',
              onClick: () => onEditRow(),
              icon: faPen,
              text: '编辑行',
              title: '编辑当前行',
              disabled: readOnly || !hasSelection || !hasJson
            },
            {
              type: 'button',
              onClick: () => onDuplicateRow(),
              icon: faClone,
              text: '复制当前行',
              title: '复制当前行 (Ctrl+D)',
              disabled: readOnly || !hasSelection || !hasJson
            },
            {
              type: 'button',
              onClick: () => onInsertBeforeRow(),
              icon: faPlus,
              text: "在当前行之前插入",
              title: '在当前行之前插入一行',
              disabled: readOnly || !hasSelection || !hasJson
            },
            {
              type: 'button',
              onClick: () => onInsertAfterRow(),
              icon: faPlus,
              text: '在当前行之后插入',
              title: '在当前行之后插入一行',
              disabled: readOnly || !hasSelection || !hasJson
            },
            {
              type: 'button',
              onClick: () => onRemoveRow(),
              icon: faTrashCan,
              text: '删除行',
              title: '删除当前行',
              disabled: readOnly || !hasSelection || !hasJson
            }
          ]
        }
      ]
    }
  ]
}
