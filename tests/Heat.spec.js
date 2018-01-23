import Heat from '../src/Heat.jsx'
import {shallow} from 'enzyme';
import {jsdom, window, global, Enzyme} from './index'
import chai, {expect} from 'chai';
import React from 'react'


describe('<Heat /> reduceClicks function', () => {
  let reducedClicks
  let heat
  let clicks = [
    {
      x: 200,
      y: 200,
      clientwidth: window.innerWidth,
      clientheight: window.innerHeight,
      referrer: 'www.google.com',
      page: window.location.pathname,
      count: 1
    },
    {
      x: 400,
      y: 400,
      clientwidth: window.innerWidth,
      clientheight: window.innerHeight,
      referrer: 'www.reddit.com',
      page: window.location.pathname,
      count: 1
    },
    {
      x: 750,
      y: 750,
      clientwidth: window.innerWidth,
      clientheight: window.innerHeight,
      referrer: 'www.espn.com',
      page: window.location.pathname,
      count: 1
    }
  ]
  beforeEach(() => {
    heat = shallow(<Heat clicks = {clicks} />)
    reducedClicks = heat.instance().reduceClicks(heat.state().clicks, 900, 1200, 30).aggregateClicks
  })
  it('reduceClicks function reduces clicks', () => {
    expect(reducedClicks.length).to.be.equal(1200)
  })
  it('count is 3', () => {
    expect(reducedClicks.reduce((accum, curr) => {
      return accum + curr.count
    }, 0)).to.equal(3)
  })
})
