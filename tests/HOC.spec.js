import React from 'react'
import axios from 'axios'
import {jsdom, window, global, Enzyme} from './index'
import chai, {expect} from 'chai';
import {shallow, mount} from 'enzyme';
import sinon from 'sinon';
import sinonChai from 'sinon-chai'
import HOC from '../src/HOC.jsx'


const ComponentToWrap = () => {
  return (
    <div />
  )
}
let testAPI = '/api/clicks'
let WrappedComponent = HOC(testAPI, 1)(ComponentToWrap)

describe('<WrappedComponent /> intial state before mounting', () => {
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

describe('<WrappedComponent /> clicks after component mounts', () => {
    let renderedInstance,
        renderedElement,
        fakePromise1,
        fakePromise2,
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

      fakePromise1 = new Promise(resolve => {
        resolve(fakeClicksArr)
      })

      fakePromise2 = new Promise(resolve => {
        resolve(fakeClicksArr.data)
      })

      sandbox.stub(axios, 'get').returns(fakePromise1)
      sandbox.stub(renderedInstance, 'setState')
    })

    afterEach(() => {
      sandbox.restore()
    })

    describe('When component mounts, an axios request is sent to specified API endpoint', () => {
      beforeEach(() => {
        renderedInstance.componentDidMount()
      })

      it('should have sent an request to the API endpoint', () => {
        expect(axios.get).to.have.callCount(1)
        expect(axios.get).to.be.calledWith(testAPI)
      })

      describe('Given the axios request has completed successfully', () => {

        let clicksOnMount

        beforeEach(done => {
          fakePromise1
          .then((res1) => {
            return res1.data
          })
          .then((res2) => {
            clicksOnMount = res2
            done()
          })
        })
        it('sets the component state with the result', () => {
          expect(renderedInstance.setState).to.have.callCount(1)
          expect(renderedInstance.setState).to.be.calledWith({clicks: clicksOnMount})
        })

      })
    })
})

