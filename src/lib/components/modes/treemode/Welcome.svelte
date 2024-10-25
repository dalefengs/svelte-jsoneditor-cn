<svelte:options immutable={true} />

<script lang="ts">
  export let readOnly: boolean
  export let onCreateArray: () => void
  export let onCreateObject: () => void
  export let onClick: () => void
</script>

<div class="jse-welcome" on:click={() => onClick()} role="none">
  <div class="jse-space jse-before"></div>
  <div class="jse-contents">
    <div class="jse-welcome-title">Empty document</div>
    {#if !readOnly}
      <div class="jse-welcome-info">
        您可以使用快捷键粘贴剪贴板数据 <b>Ctrl+V</b>, 或使用以下选项:
      </div>
      <button
        title={"创建一个空的 JSON 对象 (输入 '{')"}
        on:click|stopPropagation={() => onCreateObject()}>Create object</button
      >
      <button
        title={"创建一个空的 JSON 数组 (输入 '[')"}
        on:click|stopPropagation={() => onCreateArray()}>Create array</button
      >
    {/if}
  </div>
  <div class="jse-space jse-after"></div>
</div>

<style src="./Welcome.scss"></style>
