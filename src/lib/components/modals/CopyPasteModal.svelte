<svelte:options immutable={true} />

<script lang="ts">
  import { isMacDevice } from '$lib/utils/navigatorUtils.js'
  import Header from './Header.svelte'
  import Modal from './Modal.svelte'

  export let onClose: () => void

  const ctrl = isMacDevice() ? '⌘' : 'Ctrl'
</script>

<Modal {onClose} className="jse-copy-paste">
  <Header title="复制和粘贴" {onClose} />

  <div class="jse-modal-contents">
    <div>这些操作无法通过菜单执行。请使用：</div>

    <div class="jse-shortcuts">
      <div class="jse-shortcut">
        <div class="jse-key">
          {ctrl}+C
        </div>
        复制
      </div>
      <div class="jse-shortcut">
        <div class="jse-key">
          {ctrl}+X
        </div>
        剪切
      </div>
      <div class="jse-shortcut">
        <div class="jse-key">
          {ctrl}+V
        </div>
        for paste
      </div>
    </div>

    <div class="jse-actions">
      <button type="button" class="jse-primary" on:click={onClose}> 关闭 </button>
    </div>
  </div>
</Modal>

<style src="./CopyPasteModal.scss"></style>
