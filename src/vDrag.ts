import type { Directive, DirectiveBinding } from 'vue'

interface DragParams {
  dropBox?: HTMLDivElement | null
  limited?: boolean
}

const defaultConfig: Required<DragParams> = {
  dropBox: null,
  limited: true,
}

const limitedCalc = (content: HTMLElement, limitedBox: HTMLDivElement) => {
  const { paddingTop, paddingLeft, paddingRight, paddingBottom } = getComputedStyle(content)

  const rgx = /[0-9]*/ig

  if (limitedBox.offsetLeft <= Number(paddingLeft.match(rgx)?.[0])) {
    limitedBox.style.left = `${Number(paddingLeft.match(rgx)?.[0])}px`
  }
  if (limitedBox.offsetTop <= Number(paddingTop.match(rgx)?.[0])) {
    limitedBox.style.top = `${Number(paddingTop.match(rgx)?.[0])}px`
  }
  if (limitedBox.offsetTop + limitedBox.offsetHeight >= content.offsetHeight - Number(paddingBottom.match(rgx)?.[0])) {
    limitedBox.style.top = `${content.offsetHeight - limitedBox.offsetHeight - Number(paddingBottom.match(rgx)?.[0])}px`
  }
  if (limitedBox.offsetLeft + limitedBox.offsetWidth >= content.offsetWidth - Number(paddingRight.match(rgx)?.[0])) {
    limitedBox.style.left = `${content.offsetWidth - limitedBox.offsetWidth - Number(paddingRight.match(rgx)?.[0])}px`
  }
}
const createContent = (
  contentBox: HTMLDivElement, el: HTMLDivElement,
  startPos: {x: number, y: number},
  limited: boolean,
) => {
  const listenContent = document.createElement('div')

  listenContent.style.position = 'absolute'
  listenContent.style.opacity = '0'
  listenContent.style.height = '100%'
  listenContent.style.width = '100%'
  listenContent.style.zIndex = '9999'
  listenContent.style.top = '0'
  listenContent.style.left = '0'
  listenContent.style.right = '0'
  listenContent.style.cursor = 'move'

  const elStartPos = {
    x: el.offsetLeft,
    y: el.offsetTop,
  }

  listenContent.addEventListener('mouseup', () => {
    contentBox?.removeChild(listenContent)
  })
  listenContent.addEventListener('mouseout', () => {
    contentBox?.removeChild(listenContent)
  })
  listenContent.addEventListener('mouseleave', () => {
    contentBox?.removeChild(listenContent)
  })
  listenContent.addEventListener('mousemove', (e: MouseEvent) => {
    el.style.left = `${elStartPos.x + e.offsetX - startPos.x}px`
    el.style.top = `${elStartPos.y + e.offsetY - startPos.y}px`
    if (limited) {
      limitedCalc(contentBox, el)
    }
  })

  contentBox.appendChild(listenContent)
}
const vDrag: Directive = {
  mounted(el: HTMLDivElement, binding: DirectiveBinding<DragParams>) {
    el.draggable = true
    const finalConfig: Required<DragParams> = { ...defaultConfig, ...binding.value }

    const dropBox = finalConfig?.dropBox || el.parentElement! as HTMLDivElement
    const { limited } = finalConfig

    dropBox.style.position = 'relative'

    el.style.position = 'absolute'

    el.addEventListener('mousedown', (e: MouseEvent) => {
      createContent(dropBox, el, { x: el.offsetLeft + e.offsetX, y: el.offsetTop + e.offsetY }, limited)
    })
  },
}

export { vDrag }
export default vDrag
