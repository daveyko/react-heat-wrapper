import React from 'react'
import Enzyme, {shallow} from 'enzyme';
import chai, {expect} from 'chai'
import sinon from 'sinon';
import sinonChai from 'sinon-chai'
import Adapter from 'enzyme-adapter-react-16';
Enzyme.configure({ adapter: new Adapter(), disableLifecycleMethods: true });
import axios from 'axios'
import HOC from '../src/Components/HOC.jsx'
import Scatter from '../src/Components/Scatter.jsx'

const ComponentToWrap = () => {
  return (
    <div />
  )
}
let testAPI = '/api/clicks'
let WrappedComponent = HOC(testAPI, 1)(ComponentToWrap)
let wrappedComponentClicksState = [
  {
    x: 200,
    y: 200,
    clientwidth: window.innerWidth,
    clientheight: window.innerHeight,
    referrer: 'www.google.com',
    page: window.location.pathname
  },
  {
    x: 400,
    y: 400,
    clientwidth: window.innerWidth,
    clientheight: window.innerHeight,
    referrer: 'www.reddit.com',
    page: window.location.pathname
  },
  {
    x: 750,
    y: 750,
    clientwidth: window.innerWidth,
    clientheight: window.innerHeight,
    referrer: 'www.espn.com',
    page: window.location.pathname
  }
]

describe('<Scatter /> filter function', () => {
  let renderedElement = shallow(<Scatter clicks = {wrappedComponentClicksState} />)
  let renderedInstance = renderedElement.instance()
  let sandbox = sinon.sandbox.create()

  before(() => {
    chai.use(sinonChai)
  })

  afterEach(() => {
    sandbox.restore()
  })

  it('filterUrl sets both the url and clicks based on url unto the local state', async () => {
    await renderedInstance.filterUrl(
      {
        target: {
          value: 'espn.com',
          checked: true
        }
      }
    )
    expect(renderedInstance.state.urls).to.be.deep.equal(['espn.com'])
    expect(renderedInstance.state.clicks).to.be.deep.equal(wrappedComponentClicksState.filter(click => click.referrer.includes('espn.com')))
  })
})

describe('Props passed from <WrappedComponent /> to <Scatter /> ', () => {
    let wrappedComponent = shallow(<WrappedComponent />)
    let wrappedComponentInstance = wrappedComponent.instance()
    let sandbox = sinon.sandbox.create()
    let container = wrappedComponent.find('.flex-container')
    let passedClicks = wrappedComponentInstance.filterClicks(wrappedComponentClicksState, container, window.innerWidth)
    let scatterComponent = shallow(<Scatter clicks = {passedClicks}/>)

    it('initial state of <Scatter /> clicks is adjusted clicks passed from <WrappedComponent />', () => {
        expect(scatterComponent.instance().state.clicks).to.be.deep.equal(passedClicks)
    })
})



