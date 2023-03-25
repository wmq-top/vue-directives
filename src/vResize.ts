import type { Directive, DirectiveBinding } from 'vue'

interface ResizeParams {
  mode?: Array<'right' | 'bottom' | 'diagonal'>,
  maxHeight?: number
  maxWidth?: number
  content?: HTMLDivElement | HTMLBodyElement
  overLay?: boolean
  limited?: boolean
}

const defaultBinding: ResizeParams = {
  mode: ['right', 'bottom', 'diagonal'],
  content: document.getElementsByTagName('body')[0],
  overLay: true,
  limited: true,
}
const createRightRod = (): HTMLDivElement => {
  const rightRod = document.createElement('div')

  rightRod.style.position = 'absolute'
  rightRod.style.width = '4px'
  rightRod.style.height = '100%'
  rightRod.style.cursor = 'e-resize'
  rightRod.style.zIndex = '999'
  rightRod.style.right = '0px'
  rightRod.className = 'hover-active'

  return rightRod
}
const createBottomRod = (): HTMLDivElement => {
  const bottomRod = document.createElement('div')

  bottomRod.style.position = 'absolute'
  bottomRod.style.width = '100%'
  bottomRod.style.height = '4px'
  bottomRod.style.cursor = 'n-resize'
  bottomRod.style.zIndex = '999'
  bottomRod.style.bottom = '0px'
  bottomRod.className = 'hover-active'

  return bottomRod
}
const createArrowRod = (): HTMLDivElement => {
  const arrowRod = document.createElement('div')

  arrowRod.style.position = 'absolute'
  arrowRod.style.width = '12px'
  arrowRod.style.height = '12px'
  arrowRod.style.cursor = 'nw-resize'
  arrowRod.style.zIndex = '9998'
  arrowRod.style.bottom = '0px'
  arrowRod.style.right = '0px'
  arrowRod.style.opacity = '0'

  return arrowRod
}

const createPullRod = (
  el: HTMLDivElement, sides: ResizeParams['mode'],
  content: ResizeParams['content'], limited: boolean,
) => {
  if (sides?.includes('right')) {
    const rightRod = createRightRod()

    rightRod.addEventListener('mousedown', (e: MouseEvent) => {
      e.stopPropagation()
      const listenContent = createListenContent(
        content, rightRod, el,
        { mode: 'width', startPos: { x: e.clientX, y: 0 } },
        limited,
      )
      rightRod.className = 'hover-active resize-active'
      content?.appendChild(listenContent)
      return false
    })

    el.appendChild(rightRod)
  }
  if (sides?.includes('bottom')) {
    const bottomRod = createBottomRod()

    bottomRod.addEventListener('mousedown', (e: MouseEvent) => {
      e.stopPropagation()
  
      const listenContent = createListenContent(
        content, bottomRod, el,
        { mode: 'height', startPos: { y: e.clientY, x: 0 } },
        limited,
      )

      bottomRod.className = 'hover-active resize-active'
      content?.appendChild(listenContent)
      return false
    })
    el.appendChild(bottomRod)
  }
  if (sides?.includes('diagonal')) {
    const arrowRod = createArrowRod()

    arrowRod.addEventListener('mousedown', (e: MouseEvent) => {
      e.stopPropagation()
  
      const listenContent = createListenContent(
        content, arrowRod, el,
        { mode: 'diagonal', startPos: { x: e.clientX, y: e.clientY } },
        limited,
      )

      content?.appendChild(listenContent)
    })
    el.appendChild(arrowRod)
    return false
  }
}
const limitedCalc = (content: HTMLElement, limitedBox: HTMLDivElement) => {
  const { paddingRight, paddingBottom } = getComputedStyle(content)

  const rgx = /[0-9]*/ig

  if (limitedBox.offsetLeft + limitedBox.offsetWidth >= content.offsetWidth - Number(paddingRight.match(rgx)?.[0])) {
    limitedBox.style.width = `${content.offsetWidth - limitedBox.offsetLeft - Number(paddingRight.match(rgx)?.[0])}px`
  }
  if (limitedBox.offsetTop + limitedBox.offsetHeight >= content.offsetHeight - Number(paddingBottom.match(rgx)?.[0])) {
    limitedBox.style.height = `${content.offsetHeight - limitedBox.offsetTop - Number(paddingBottom.match(rgx)?.[0])}px`
  }
}
// eslint-disable-next-line max-lines-per-function
const createListenContent = (
  content: ResizeParams['content'],
  pullRod: HTMLDivElement,
  reactiveEl: HTMLDivElement,
  pattern: {mode: 'width' | 'height' | 'diagonal', startPos: {x: number, y: number}},
  limited: boolean,
): HTMLDivElement => {
  const listenContent = document.createElement('div')

  listenContent.style.position = 'fixed'
  listenContent.style.opacity = '0'
  listenContent.style.height = '100vh'
  listenContent.style.width = '100vw'
  listenContent.style.zIndex = '9999'
  listenContent.style.top = '0'
  listenContent.style.left = '0'
  listenContent.style.right = '0'

  listenContent.addEventListener('mouseup', () => {
    content?.removeChild(listenContent)
    pullRod.className = 'hover-active'
  })
  listenContent.addEventListener('mouseout', () => {
    content?.removeChild(listenContent)
    pullRod.className = 'hover-active'
  })
  listenContent.addEventListener('mouseleave', () => {
    content?.removeChild(listenContent)
    pullRod.className = 'hover-active'
  })
  const startWidth = reactiveEl.clientWidth
  const startHeight = reactiveEl.clientHeight

  listenContent.addEventListener('mousemove', (e: MouseEvent) => {
    if (pattern.mode === 'width') {
      reactiveEl.style.width = `${startWidth + e.clientX - pattern.startPos.x}px`
    } else if (pattern.mode === 'height') {
      reactiveEl.style.height = `${startHeight + e.clientY - pattern.startPos.y}px`
    } else if (pattern.mode === 'diagonal') {
      reactiveEl.style.width = `${startWidth + e.clientX - pattern.startPos.x}px`
      reactiveEl.style.height = `${startHeight + e.clientY - pattern.startPos.y}px`
    }
    if (limited) {
      limitedCalc(reactiveEl.parentElement!, reactiveEl)
    }
  })

  return listenContent
}

const vResize: Directive = {
  mounted(el: HTMLDivElement, binding: DirectiveBinding<ResizeParams>) {
    if (!el.style.position) {
      el.style.position = 'relative'
    }
    const finalConfig: ResizeParams = { ...defaultBinding, ...binding.value }
    const { mode, limited } = finalConfig

    const bodyContent = finalConfig.content!

    createPullRod(el, mode, bodyContent, limited!)
  },
}

export { vResize }
