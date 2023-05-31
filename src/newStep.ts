import type { Directive, DirectiveBinding } from 'vue'

type TipsPos = 'top' | 'left' | 'right' | 'bottom'
type CustomStyle = {
  shadow: string
  shadowFocus: string
}
type StepConfig = {
  trigger: boolean
  stepKey: string
  currentStepKey: string
  text: string
  position: TipsPos
  mask: boolean
  customStyle: CustomStyle
  next: <T>(key: T) => T,
  exit: () =>void
}

const defaultBind = {
  customStyle: {
    shadow: `0px 0px 6px #4cb2fd`,
    shadowFocus: `0px 0px 10px #4cb2fd`
  } as CustomStyle
}
// 检查当前元素是否是块级元素
const isBlockElement = (el: any):boolean => {
  let result = false;
  if(el.currentStyle) {
    result = el.currentStyle.display === 'block';
  } else {
    result = getComputedStyle(el).display === 'block';
  }
  return result
}
// 构造resize观测器
const constructObserver = (effectEle: Element): ResizeObserver => {
  const resizeObserver = new ResizeObserver(() => {
    // most important top: 上边距离body上的距离
    console.log(effectEle.getBoundingClientRect())
  })
  return resizeObserver
}
const createMessageBox = (text: string, elRect: DOMRect, position: TipsPos):HTMLDivElement => {
  const msgBox = document.createElement('div')
  msgBox.style.position = 'absolute'
  msgBox.style.padding = '1rem'

  return msgBox
}
// 使当前元素获取相对定位relative属性
const relativeEl = (el: HTMLDivElement, binding:StepConfig): void => {
  if(!isBlockElement(el)) {
    console.warn('v-step should only bind on block element', ['@murry_qx/vue-directives', 'vStep'])
    return
  }
  const {shadow, shadowFocus} = {...defaultBind.customStyle, ...binding.customStyle}
  const { text } = {...defaultBind, ...binding}
  el.style.position = 'relative'
  el.style.cursor = 'pointer'
  el.style.boxShadow = shadow
  el.addEventListener('mouseover', () => {
    el.style.boxShadow = shadowFocus
  })
  el.addEventListener('mouseleave', () => {
    el.style.boxShadow = shadow
  })
  const rect = el.getBoundingClientRect()
  const messageBox = createMessageBox(text)
  // 通过监听body变化
  constructObserver(el).observe(document.body)
}
const vStep: Directive = {
  mounted(el: HTMLDivElement, binding: DirectiveBinding<StepConfig>) {
    relativeEl(el, binding.value)
  },
  updated(el: HTMLDivElement, binding: DirectiveBinding<StepConfig>) {
    relativeEl(el, binding.value)
  },
}
export { vStep }
export type { StepConfig }