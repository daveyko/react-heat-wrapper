import React from 'react'
import {jsdom, window, global, Enzyme} from './index'
import HOC from '../src/HOC.jsx'
import Scatter from '../src/Scatter.jsx'
import chai, {expect} from 'chai';
import {shallow, mount} from 'enzyme';

const ComponentToWrap = () => {
  return (
    <div />
  )
}
let testAPI = '/api/clicks'
let WrappedComponent = HOC(testAPI, 1)(ComponentToWrap)

describe('<Scatter /> initial click state', () => {
  let wrappedComponent
  let wrappedComponentClicksState
  let container
  beforeEach(() => {
    wrappedComponent = shallow(<WrappedComponent />)
    container = wrappedComponent.find('.flex-container')
    wrappedComponent.setState({graph: 'Scatter'})
    wrappedComponentClicksState = [
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
    wrappedComponent.setState({clicks: wrappedComponentClicksState})
  })

    it('renders ScatterPlot component on selecting option', () => {
      expect(wrappedComponent.find(Scatter).length).to.be.equal(1)
  })
    it('Initial state of ScatterPlot clicks is the adjustedClicks prop passed from <HOC />', () => {
      let scatterClicks = wrappedComponent.instance().filterClicks(wrappedComponent.state().clicks,  container, window.innerWidth)
      let scatter = shallow(<Scatter clicks = {scatterClicks} />)
      expect(scatter.state().clicks).to.be.equal(scatterClicks)
    })
})
