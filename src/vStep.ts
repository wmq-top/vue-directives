import type { Directive, DirectiveBinding } from 'vue'

type TipsPos = 'top' | 'left' | 'right' | 'bottom'
interface StepConfig {
  trigger: boolean
  step: number,
  currentStep: number,
  text: string
  position: TipsPos
  next: ()=> void
  jumpAll: ()=> void
}
interface TipsBoxParams {
  step: number,
  text: string,
  posMsg: PositionMsg,
  position: TipsPos
}
interface PositionMsg {
  top: number
  left: number
  height: number,
  width: number
}
const defaultTipsStyle = {
  button: {
    marginRight: '0.5rem',
    fontSize: '0.5rem',
    backgroundColor: '#5667be',
    border: 'none',
    outline: 'none',
    color: 'white',
    height: '1.5rem',
    cursor: 'pointer',
    borderRadius: '3px',
  } as CSSStyleDeclaration,
  content: {
    position: 'fixed',
    zIndex: '99999',
    padding: '0.5rem',
    textAlign: 'center',
    backgroundColor: 'white',
    maxWidth: '200px',
    minWidth: '150px',
    borderRadius: '5px',
    wordWrap: 'break-word',
  } as CSSStyleDeclaration,
}
const calcCurrentBoxPos = (el: HTMLDivElement): PositionMsg => {
  const { top, left, height, width } = el.getBoundingClientRect()

  return {
    top,
    left,
    height,
    width,
  }
}
const buildCoverBox = (posMsg: PositionMsg, step: number) => {
  const leftDiv = document.createElement('div')
  const topDiv = document.createElement('div')
  const rightDiv = document.createElement('div')
  const bottomDiv = document.createElement('div')
  const coverArr = [leftDiv, topDiv, rightDiv, bottomDiv]

  coverArr.forEach((i: HTMLDivElement) => {
    i.style.position = 'fixed'
    i.style.zIndex = '9999'
    i.style.backgroundColor = 'rgba(0,0,0,0.2)'
    i.className = `vue-directive-step-cover-${step}`
  })

  leftDiv.style.height = '100%'
  leftDiv.style.width = `${posMsg.left}px`
  leftDiv.style.top = '0'
  leftDiv.style.left = '0'

  topDiv.style.height = `${posMsg.top}px`
  topDiv.style.top = '0'
  topDiv.style.left = `${posMsg.left}px`
  topDiv.style.width = `${posMsg.width}px`

  rightDiv.style.height = '100%'
  rightDiv.style.width = `${document.documentElement.clientWidth - posMsg.left - posMsg.width}px`
  rightDiv.style.top = '0'
  rightDiv.style.right = '0'

  bottomDiv.style.height = `${document.documentElement.clientHeight - posMsg.top - posMsg.height}px`
  bottomDiv.style.width = `${posMsg.width}px`
  bottomDiv.style.left = `${posMsg.left}px`
  bottomDiv.style.bottom = '0'

  document.body.appendChild(leftDiv)
  document.body.appendChild(topDiv)
  document.body.appendChild(rightDiv)
  document.body.appendChild(bottomDiv)
}
const calcPosition = (el: HTMLDivElement, posMsg: PositionMsg, tipsPos: PositionMsg, position: TipsPos): void => {
  if (position === 'bottom') {
    el.style.left = `${posMsg.left + (posMsg.width / 2) - (tipsPos.width / 2)}px`
    el.style.top = `${posMsg.top + posMsg.height + 10}px`
  } else if (position === 'top') {
    el.style.left = `${posMsg.left + (posMsg.width / 2) - (tipsPos.width / 2)}px`
    el.style.top = `${posMsg.top - tipsPos.height - 10}px`
  } else if (position === 'left') {
    el.style.left = `${posMsg.left - tipsPos.width - 10}px`
    el.style.top = `${posMsg.top + (posMsg.height / 2) - (tipsPos.height / 2)}px`
  } else if (position === 'right') {
    el.style.left = `${posMsg.left + posMsg.width + 10}px`
    el.style.top = `${posMsg.top + (posMsg.height / 2) - (tipsPos.height / 2)}px`
  } else {
    el.style.left = `${posMsg.left + (posMsg.width / 2) - (tipsPos.width / 2)}px`
    el.style.top = `${posMsg.top + posMsg.height + 10}px`
  }
}
const buildTipsBox = ({ step, text, posMsg, position }: TipsBoxParams, next: ()=> void, jumpAll: ()=> void) => {
  const tipsContent = document.createElement('div')
  const jumpButton = document.createElement('button')
  const nextButton = document.createElement('button')
  const operateBox = document.createElement('div')

  jumpButton.innerHTML = '跳过步骤'
  nextButton.innerHTML = '下一步'

  Object.keys(defaultTipsStyle.button).forEach((item: any) => {
    jumpButton.style[item] = defaultTipsStyle.button[item]
    nextButton.style[item] = defaultTipsStyle.button[item]
  })

  nextButton.addEventListener('click', () => {
    next()
  })
  jumpButton.addEventListener('click', () => {
    jumpAll()
  })

  operateBox.style.display = 'flex'
  operateBox.style.justifyContent = 'space-around'
  operateBox.style.marginTop = '0.5rem'

  operateBox.appendChild(jumpButton)
  operateBox.appendChild(nextButton)
  tipsContent.innerHTML = text + step

  Object.keys(defaultTipsStyle.content).forEach((item: any) => {
    tipsContent.style[item] = defaultTipsStyle.content[item]
  })

  tipsContent.className = `vue-directive-step-tips-${step}`
  tipsContent.appendChild(operateBox)

  document.body.appendChild(tipsContent)
  // 获取提示卡片的大小
  const tipsPos = tipsContent.getBoundingClientRect()

  calcPosition(tipsContent, posMsg, tipsPos, position)
}
const clearALLStepNode = (step: number) => {
  const nodeArr = document.getElementsByClassName(`vue-directive-step-cover-${step}`)
  const tipsArr = document.getElementsByClassName(`vue-directive-step-tips-${step}`)

  while (nodeArr.length !== 0) {
    document.body.removeChild(nodeArr[0])
  }
  while (tipsArr.length !== 0) {
    document.body.removeChild(tipsArr[0])
  }
}
const startStep = (el: HTMLDivElement, binding: DirectiveBinding<StepConfig>, needClean: boolean) => {
  const { trigger, step, currentStep, position, text, next, jumpAll } = binding.value

  if (!trigger) {
    needClean && clearALLStepNode(step)
    return
  }

  if (step !== currentStep) {
    needClean && clearALLStepNode(step)
    return
  }

  const posMsg = calcCurrentBoxPos(el)

  buildCoverBox(posMsg, step)
  buildTipsBox({ step, text, posMsg, position }, next, jumpAll)
}
const vStep: Directive = {
  mounted(el: HTMLDivElement, binding: DirectiveBinding<StepConfig>) {
    startStep(el, binding, false)
  },
  updated(el: HTMLDivElement, binding: DirectiveBinding<StepConfig>) {
    startStep(el, binding, true)
  },
}
export { vStep }
export default vStep
