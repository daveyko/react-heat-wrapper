import React, {Component} from 'react'
import axios from 'axios'
import Scatterplot from './Scatter.jsx'
import HeatMap from './Heat.jsx'
import style from '../../public/Componentstyles/HOC.css'

//HOF takes user provided route to store click data and the user-given id of the wrapper (required: if only 1 component is to be wrapped can be given id of 0, then any other components could be given an id of 1, 2...etc ) and returns a function that takes the react component to begin tracking click data as an argument and returns a higher-order component
const HOCWrapper  = (clicksAPI, id) => (WrappedComponent) => {

	return class HOC extends Component {
		constructor (props) {
			super(props)
			this.state = {
				graph: 'Hide',
				clicks: [],
				screenSize: 0,
				localStorageKey: 'session',
				buttonView: false
			}

			this.onClick = this.onClick.bind(this)
			this.toggleGraph = this.toggleGraph.bind(this)
			this.onScreenResize = this.onScreenResize.bind(this)
			this.closeGraph = this.closeGraph.bind(this)
			this.filterClicks  = this.filterClicks.bind(this)
		}

		componentDidMount() {
			localStorage.clear()
			//sets a global window variable: viewHeatMap(id) which user must type into the chrome console to view the button which toggles the view of the heatmap
			window[`viewHeatMap${id}`] = () => {
				this.setState({
					buttonView: true
				})
			}
			//axios request to get clicks from database and persist them on the browser session, afterwards placing them on the component's local state
			return axios.get(clicksAPI)
			.then((clicks => {
					localStorage.setItem(this.state.localStorageKey, JSON.stringify(clicks.data))
					return clicks.data
			}))
			.then((clicksOnMount) => {
						this.setState({
						clicks: clicksOnMount,
					})
				})
			.catch(console.error)
		}

    //function describes the request body sent to the clicks API
		onClick(e){
			let reqbody = {
				x: e.pageX,
				y: e.pageY,
				clientwidth: window.innerWidth,
				clientheight: window.innerHeight,
				referrer: document.referrer,
				page: window.location.pathname,
			}
			this.postClick(reqbody)
		}

    //http post request which posts user click to clicks model and also adds the click to session storage
		postClick(body){
			axios.post(clicksAPI, body)
				.then((res) => {
					let currSession = JSON.parse(localStorage.getItem(this.state.localStorageKey))
					currSession.push(res.data)
					localStorage.setItem(this.state.localStorageKey, JSON.stringify(currSession))
				})
    }

    //turns the heat map on & off. Need to re-set the clicks state even though it was set on componentDidMount because since the component had mounted the user may have changed the viewport width
		toggleGraph(e){
			if (e.target.value === 'exit'){
				this.setState({
					buttonView: false
				})
			} else {
				let clicks = JSON.parse(localStorage.getItem(this.state.localStorageKey))
				let filteredClicks = this.filterClicksOnResize(clicks, window.innerWidth)
				this.setState({
					clicks: filteredClicks,
					graph: e.target.value
				})
			}
		}

    //closes the heat map graph
		closeGraph(){
			this.setState({
				graph: 'Hide'
			})
		}

    //filters for clicks that occured within the dimensions of the wrapped components and ensures that any click that occured on the page is adjusted for top and left properties of elements outside the borders of the wrapped component. Also filters clicks for those that occured in this location.pathname. Called using parent div of Wrapper but on resize we call this function on the parent div of Scatter
		filterClicks(rawClicks, container, width){
			return rawClicks.filter(click => {
				return (click.x <= container.offsetWidth && click.x >= container.getBoundingClientRect().left) && (click.y <= container.offsetHeight && click.y >= container.getBoundingClientRect().top) && (click.clientwidth === width && click.page === window.location.pathname)
			})
				.map(click => {
					return Object.assign({}, click, {x: click.x - container.getBoundingClientRect().left, y: click.y - container.getBoundingClientRect().top})
				})
    }

    //helper function used to filter clicks when the viewport is resized to only show clicks made on
    //the current viewport size
		filterClicksOnResize(rawClicks, width){
			return rawClicks.filter(click => {
				return (click.clientwidth === width && click.page === window.location.pathname)
			})
		}

    //main function called when viewport is resized
    //updates state with clicks made on current viewport size
		onScreenResize(width, compheight, compwidth){
			let cachedClicks = localStorage.getItem(this.state.localStorageKey)
			let parsedClicks = JSON.parse(cachedClicks)
			let filteredClicks = this.filterClicksOnResize(parsedClicks, width)
			this.setState({
				clicks: filteredClicks,
				compheight,
				compwidth,
				screenSize: width
			})
		}

		render(){
      //on initial mounting, this.container is defined and we can utilize this to adjust the clicks at the top level component
      let adjustedClicks
      //on resize, this.container is not defined since we are not rendering the div, so we need to filter the clicks further down in the Scatter component
			let onResizeClicks
			if (this.container){
				 adjustedClicks = this.filterClicks(this.state.clicks, this.container, window.innerWidth)
			} else {
				onResizeClicks = this.filterClicksOnResize(this.state.clicks, window.innerWidth)
			}

			return (
				this.state.graph === 'Hide' ?
					<div onClick = {!this.state.buttonView ? this.onClick : null} className = {style['flex-container']} ref = {container => this.container = container}>
						{this.state.buttonView ?
            <select id = "dropdown" className = {style.dropdown}  onChange = {this.toggleGraph}>
							<option>{this.state.graph === 'Hide' ? 'Select Graph' : this.state.graph}</option>
							<option value = "Scatter" >Scatter</option>
							<option value = "HeatMap">HeatMap</option>
							<option value = "exit">Exit</option>
						</select> : null }
						<WrappedComponent {...this.props} />
					</div>
					:
					<div className = {style.parent}>
          	{this.state.graph === 'Scatter' ? <div className = {style.HOCWrapper}>
							<Scatterplot filterClicks = {this.filterClicks} onResizeClicks = {onResizeClicks} clicks = {adjustedClicks} removeGraph = {this.closeGraph} onScreenResize = {this.onScreenResize}  />
							</div> : 	<div className = {style.HOCWrapper}>
							<HeatMap filterClicks = {this.filterClicks} onResizeClicks = {onResizeClicks} clicks = {adjustedClicks}  removeGraph = {this.closeGraph} onScreenResize = {this.onScreenResize} />
						</div>
						}
						<WrappedComponent {...this.props} />
					</div>
			)
		}
	}
}

export default HOCWrapper

