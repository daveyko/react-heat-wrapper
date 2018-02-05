import React from 'react'
import Enzyme, {shallow} from 'enzyme';
import chai, {expect} from 'chai'
import sinon from 'sinon';
import sinonChai from 'sinon-chai'
import Adapter from 'enzyme-adapter-react-16';
Enzyme.configure({ adapter: new Adapter(), disableLifecycleMethods: true });
import axios from 'axios'
import HOC from '../src/Components/HOC.jsx'


const ComponentToWrap = () => {
  return (
    <div />
  )
}
let testAPI = '/api/clicks'
let WrappedComponent = HOC(testAPI, 1)(ComponentToWrap)

describe('<WrappedComponent /> initial state before mounting', () => {
    let wrappedComponent
    let initialState = {
      graph: 'Hide',
      clicks: [],
      screenSize: 0,
      localStorageKey: 'session',
      buttonView: false
    }

    beforeEach('Create component', () => {
      wrappedComponent = shallow(<WrappedComponent />)
    })

    it('has an initial local state with graph property set to Hide', () => {
      expect(wrappedComponent.state()).to.be.deep.equal(initialState)
    })
})

describe('<WrappedComponent /> componentDidMount', () => {
    let renderedInstance,
        renderedElement,
        sandbox

    let fakeClicksArr =  {
      data: [
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
    }

    before(() => {
      chai.use(sinonChai)
    })
    beforeEach(() => {
      sandbox = sinon.sandbox.create();
      renderedElement = shallow(<WrappedComponent />)
      renderedInstance = renderedElement.instance()
      sandbox.stub(axios, 'get').resolves(fakeClicksArr)
      sandbox.stub(renderedInstance, 'setState')
    })

    afterEach(() => {
      sandbox.restore()
    })

    it('componentDidMount stores clicks in local storage', async () => {
      await renderedInstance.componentDidMount()
      expect(JSON.parse(localStorage.getItem(renderedInstance.state.localStorageKey))).to.deep.equal(fakeClicksArr.data)
    })

    it('componentDidMount sets state with clicks', async () => {
      await renderedInstance.componentDidMount()
      expect(renderedInstance.setState).to.be.calledWith({clicks: fakeClicksArr.data})
  })
})

