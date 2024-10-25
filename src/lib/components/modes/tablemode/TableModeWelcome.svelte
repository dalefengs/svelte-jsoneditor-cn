<svelte:options immutable={true} />

<script lang="ts">
  import type { JSONPath } from 'immutable-json-patch'
  import { getIn, isJSONArray, isJSONObject } from 'immutable-json-patch'
  import type { JSONParser, OnChangeMode } from '$lib/types.js'
  import { Mode } from '$lib/types.js'
  import { valueType } from '$lib/utils/typeUtils.js'
  import { findNestedArrays } from '$lib/logic/table.js'
  import { isEmpty } from 'lodash-es'
  import { stringifyJSONPath } from '$lib/utils/pathUtils.js'

  export let text: string | undefined
  export let json: unknown | undefined
  export let readOnly: boolean
  export let parser: JSONParser
  export let openJSONEditorModal: (path: JSONPath) => void
  export let onChangeMode: OnChangeMode
  export let onClick: () => void

  $: action = readOnly ? '查看' : '编辑'

  let nestedArrayPaths: JSONPath[]
  $: nestedArrayPaths = json
    ? findNestedArrays(json)
        .slice(0, 99)
        .filter((path) => path.length > 0)
    : []
  $: hasNestedArrays = !isEmpty(nestedArrayPaths)
  $: isEmptyDocument = json === undefined && (text === '' || text === undefined)

  $: documentType = hasNestedArrays
    ? '具有嵌套数组的对象'
    : isEmptyDocument
      ? '一个空文档'
      : isJSONObject(json)
        ? '一个对象'
        : isJSONArray(json)
          ? '一个空数组' // note: can also be an array with objects but without properties
          : `A ${valueType(json, parser)}`

  function countItems(nestedArrayPath: JSONPath): number {
    return (getIn(json, nestedArrayPath) as JSONPath).length
  }
</script>

<div class="jse-table-mode-welcome" on:click={() => onClick()} role="none">
  <div class="jse-space jse-before"></div>

  <div class="jse-nested-arrays">
    <div class="jse-nested-arrays-title">{documentType}</div>
    <div class="jse-nested-arrays-info">
      {#if hasNestedArrays}
        对象不能使用表格模式。您可以改为打开嵌套数组，或以树模式打开文档。
      {:else}
        {documentType} 不能使用表格模式
      {/if}
      {#if isEmptyDocument && !readOnly}
        你可以选择以树形模式打开文档，或者粘贴一个JSON数组。 <b>Ctrl+V</b>.
      {:else}
        你可以使用 tree 模式打开文档。
      {/if}
    </div>
    {#each nestedArrayPaths as nestedArrayPath}
      {@const count = countItems(nestedArrayPath)}

      <button
        type="button"
        class="jse-nested-array-action"
        on:click={() => openJSONEditorModal(nestedArrayPath)}
      >
        {action} "{stringifyJSONPath(nestedArrayPath)}"
        <span class="jse-nested-array-count">({count} {count !== 1 ? 'items' : 'item'})</span>
      </button>
    {/each}
    <button type="button" class="jse-nested-array-action" on:click={() => onChangeMode(Mode.tree)}>
      使用树模式{action}
    </button>
  </div>

  <div class="jse-space jse-after"></div>
</div>

<style src="./TableModeWelcome.scss"></style>
