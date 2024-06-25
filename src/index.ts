import '@logseq/libs'

async function fetchTitle(link: string): Promise<string>{
  const r = await fetch(link)
  const text = await r.text();

  const parser = new DOMParser();
  const htmlDoc = parser.parseFromString(text, 'text/html');
  const titleElement = htmlDoc.head.querySelector('title');
  if (titleElement == null) return ''

  const title = titleElement.innerText.replace(' - YouTube', '')

  return title
}

async function pasteHandler(e: ClipboardEvent) {
  const text = e.clipboardData?.getData('text')

  if (text == null) return

  if (!text.startsWith('https://www.youtube.com/watch?v=')) return

  e.preventDefault()
  e.stopPropagation()

  const currentBlock = await logseq.Editor.getCurrentBlock()

  if (currentBlock == null) return

  logseq.Editor.insertBlock(currentBlock.uuid, '{{video ' + text + '}}')
  fetchTitle(text).then( title => {
    logseq.Editor.updateBlock(currentBlock.uuid, title)
  })
  
}

async function main (): Promise<void> {
  const mainContentContainer = parent.document.getElementById(
    "main-content-container",
  )

  if (mainContentContainer == null) return

  mainContentContainer.addEventListener("paste", pasteHandler)

  logseq.beforeunload(async () => {
    mainContentContainer.removeEventListener("paste", pasteHandler)
  })
}

// bootstrap
logseq.ready(main).catch(console.error)

