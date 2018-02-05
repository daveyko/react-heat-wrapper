import React from 'react'
import Popout from 'react-popout'
const d3  = require('d3')
import style from '../../public/Componentstyles/Scatter.css'


class Scatterplot extends React.Component {

	constructor(props){
		super(props)
		this.state = {
			showPopout: false,
			clicks: this.props.clicks || this.props.onResizeClicks,
			urls: [],
			top10Urls: []
		}
		this.showPopout = this.showPopout.bind(this)
		this.findTopTenSites = this.findTopTenSites.bind(this)
		this.filterUrl = this.filterUrl.bind(this)
		this.showAll = this.showAll.bind(this)
		this.onClose = this.onClose.bind(this)
		this.selectOption = this.selectOption.bind(this)
		this.promisifySetState = this.promisifySetState.bind(this)
	}
	//allows chaining of setState instead of callbacks
	promisifySetState(state) {
		return new Promise(resolve => {
			this.setState(state, resolve)
		})
	}

  //When passed props changes, we need to trigger a re-render of the scatterplot. The passed props may be this.props.onResizeClicks when the viewport has been modified, otherwise it will be this.props.clicks
	componentWillReceiveProps(nextProps){
      if (nextProps.clicks !== this.props.clicks || nextProps.onResizeClicks !== this.props.onResizeClicks){
			let onResizeClicks
        if (nextProps.onResizeClicks){
          onResizeClicks = this.props.filterClicks(nextProps.onResizeClicks, this.size, window.innerWidth)
        }
        this.setState({
          top10Urls: this.findTopTenSites(onResizeClicks),
          clicks: nextProps.clicks || onResizeClicks
        })
		  }
	}

  //When component mounts, find the top 10 sites from where visitors to the site navigated to this site from. Also we want to add an event listener which will re-filter clicks on window resize and re-render the Scatter component.
	componentDidMount(){
		let top10Urls = this.findTopTenSites(this.props.clicks)
		this.setState({
			top10Urls,
		})
		window.addEventListener('resize', () => {
			if (this.size){
				this.props.onScreenResize(window.innerWidth, this.size.offsetHeight,
					this.size.offsetWidth)
			}
		})
	}

  //this function finds all the urls from where visitors to the sites navgiated, shortens the string, then finds the frequencies by mapping sites to an object, and sorts the object from greatest to least
	findTopTenSites(clicks){
		let urls = clicks.map(click => click.referrer)
		let websites = urls.map(url => {
			if (url.length > 3){
				let secondIndex = url.indexOf('/', url.indexOf('/') + 1)
				let lastIndex = url.indexOf('/', secondIndex + 1)
				let website = url.substring(secondIndex + 1, lastIndex)
				return website
			} else {
				return url
			}
		})
		let siteFrequencyMap = {}
		websites.forEach(website => {
			if (!siteFrequencyMap[website]) siteFrequencyMap[website] = 1
			else siteFrequencyMap[website]++
		})
		return Object.keys(siteFrequencyMap).sort((a, b) => siteFrequencyMap[b] - siteFrequencyMap[a]).slice(0, 10)
	}

  //shows the popout to allow user to filter
	showPopout(){
		this.setState({showPopout: true})
	}

  //filters clicks by url
	filterUrl(e){
		let clicks = this.props.clicks || this.props.filterClicks(this.props.onResizeClicks, this.size, window.innerWidth)
		if (e.target.checked){
			return this.promisifySetState({
				urls: this.state.urls.concat(e.target.value),
			})
			.then(() => {
				return this.promisifySetState({
					clicks: clicks.filter(click => {
						return this.state.urls.filter(url => {
							return click.referrer.includes(url)
						}).length > 0
					})
				})
			})
			.catch(console.error)
		} else {
      return this.promisifySetState({
				urls: this.state.urls.filter(url => {
					return url !== e.target.value
				})
			})
			.then(() => {
				return this.promisifySetState({
					clicks: clicks.filter(click => {
						return this.state.urls.filter(url => {
							return click.referrer.includes(url)
						}).length > 0
					})
				})
			})
			.catch(console.error)
		}
	}

  //shows all clicks
	showAll(e){
		let onResizeClicks
		if (e.target.checked){
			if (!this.props.clicks) onResizeClicks = this.props.filterClicks(this.props.onResizeClicks, this.size, window.innerWidth)
			this.setState({
				urls: this.state.top10Urls,
				clicks: this.props.clicks || onResizeClicks
			})
		} else {
			this.setState({
				urls: [],
				clicks: []
			})
		}
	}

  //closes out the filtering popout
	onClose(){
		this.setState({
			showPopout: false
		})
	}

  //allows user to select an option to close out the filter or activate the filtering popout
	selectOption(e){
		if (e.target.value === 'close') this.props.removeGraph()
		if (e.target.value === 'filter') this.showPopout()
	}


	render(){
		let clicks = this.state.clicks
    let size = this.size ? this.size.offsetHeight : window.innerHeight

    //creates the color function which maps a click circle to a particular color based on its url
		let color = d3.scaleQuantile()
			.domain([0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10])
      .range(['red', 'orange', 'yellow', 'green', 'blue', 'purple', 'brown', 'white', 'black', 'gray'])

    //creates circle svg elements by mapping over clicks on state
		let circles = clicks.map((datapoint, i) => {
			return (
				<g key = {i} className = {style.clickData}>
					<circle
						cx = {datapoint.x}
						cy = {datapoint.y}
						r = {5}
						fill = {
							this.state.top10Urls.filter(shortened => datapoint.referrer.includes(shortened)).length >= 1 ? color(this.state.top10Urls.indexOf(this.state.top10Urls.filter(shortened => datapoint.referrer.includes(shortened))[0])) : 'black'}
						data-count = {datapoint.count}
						data-url = {datapoint.referrer}
						data-id = {datapoint.id}
					/>
					<text x = {datapoint.x + 50} y = {datapoint.y}>
						<tspan className = {style.referrerText} x = {datapoint.x < 50 ? datapoint.x + 50 : datapoint.x >= datapoint.clientwidth - 100 ? datapoint.x - 100 : datapoint.x} y = {datapoint.y < 50 ? datapoint.y + 25 : datapoint.y > size - 100 ? datapoint.y - 25 : datapoint.y - 10}>{datapoint.referrer}</tspan>
					</text>
				</g>
			)
		})
		return (
			<div className = {style.HOCSvgWrapper} ref = {size => this.size = size}>
				<div>
					{this.state.showPopout ?
						<Popout title = "filterPopout" onClosing = {this.onClose}>
							<div>
								{this.state.top10Urls.map((site, i) => {
									return (
										<div key = {i}>
											<input type = "checkbox" id = {site} name = {site} value = {site} onChange = {this.filterUrl} />
											<label>{site}</label>
										</div>
									)
								})
								}
								<div>
									<input type = "checkbox" id = "showAll" name = "showAll" value = "showAll" onChange = {this.showAll} />
									<label>Show All</label>
								</div>
							</div>
						</Popout> : null
					}
				</div>
				<select className = {style.selectOption} onChange = {this.selectOption}>
					<option selected>Select Option</option>
					<option value = "filter">Filter</option>
					<option value = "close">Close</option>
				</select>
				<svg className = {style.HOCSvg}>
					<g className = {style.HOCSvg}>
						{circles}
					</g>
				</svg>
			</div>
		)
	}
}

export default Scatterplot
