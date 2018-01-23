import React from 'react'
const d3 = require('d3')
const _ = require('lodash')
import style from '../../public/Componentstyles/Heat.css'

class HOCHeat extends React.Component {
	constructor(props){
		super(props)
		this.state = {
			clicks: this.props.clicks || this.props.onResizeClicks,
			height: 0
		}
  }

 //When passed props changes, we need to trigger a re-render of the scatterplot. The passed props may be this.props.onResizeClicks when the viewport has been modified, otherwise it will be this.props.clicks
	componentWillReceiveProps(nextProps){
		if (nextProps.clicks !== this.props.clicks || nextProps.onResizeClicks !== this.props.onResizeClicks){
			let onResizeClicks
			if (nextProps.onResizeClicks){
				onResizeClicks = this.props.filterClicks(nextProps.onResizeClicks, this.size, window.innerWidth)
			}
			this.setState({
				clicks: nextProps.clicks || onResizeClicks
			})
		}
	}

	componentDidMount() {
		this.setState({height: this.size.offsetHeight})
		window.addEventListener('resize', () => {
			if (this.size){
				this.props.onScreenResize(window.innerWidth, this.size.offsetHeight,
					this.size.offsetWidth  )
			}
		})
	}

  //reducing clicks to aggregate click data into repeating rows of rectangle SVGs
  reduceClicks(clicks, componentWidth, componentHeight, numRect) {
		let rectWidth = componentWidth / numRect
		let rectHeight = rectWidth
		let aggregateClicks = []
		let x = 0
		let y = 0
		let row = 0
		let col = 0
		let reduced = {count: 0, x, y}
		while (y < componentHeight){
			while (x < componentWidth){
        let square = clicks
        .filter((click) => {
					return (click.x >= x && click.x < x + rectWidth) && (click.y >= y && click.y < y + rectHeight)
        })
        .map((filteredClick) => {
					return Object.assign({}, filteredClick, {x, y})
				})

				if (square.length > 1){
					reduced = square.reduce((a, b) => {
						return {count: a.count + b.count, col, row}
					})
				} else if (square.length === 1){
					reduced = {count: square[0].count, col, row}
				} else {
					reduced = {count: 0, col, row}
				}
				aggregateClicks.push(reduced)
				x += rectWidth
				col++
			}
			x = 0
			col = 0
			y += rectHeight
			row++
		}
		return {aggregateClicks, rectWidth, rectHeight}
	}


	render(){
		let componentHeight =  this.state.height || window.innerHeight
    let clicksObject = this.reduceClicks(this.state.clicks, window.innerWidth, componentHeight, 30)
    let aggregateClicks = clicksObject.aggregateClicks

    //d3 logic
    let totalClicks = d3.sum(aggregateClicks, (c) => c.count)

    //function to scale rectangles along x axis
		let xScale = d3.scaleLinear()
			.range([0, this.props.width || window.innerWidth])
			.domain(d3.extent(aggregateClicks, c => c.col))

		let domainY = d3.extent(aggregateClicks, c => c.row)
    domainY[1] = domainY[1] + 1

    //function to scale rectangles along y axis
		let yScale = d3.scaleLinear()
			.range([0, this.state.height || window.innerHeight])
			.domain(domainY)

    //finding min and max of clicks to create an appropriate color scale function to adjust rectangle colors based on number of clicks
		let clicksMin = d3.min(aggregateClicks, (d) => d.count)
		let clicksMax = d3.max(aggregateClicks, (d) => d.count)
		let domainRange = _.range(clicksMin, clicksMax, (clicksMax - clicksMin) / 7 )

		let colorScale = d3.scaleThreshold()
			.domain(domainRange.length ? domainRange : [0])
			.range(['#66ff00', '#80d408', '#8cbf0d', '#a69515', '#b3801a', '#cc5522', '#e62b2b', '#ff0033'])

    //mapping over aggregate clicks to create an svg rectangle for each grouping of clicks
		let heatmap = aggregateClicks.map((click, i) => {
			return (
				<g key = {i} className = {style.clickData}>
					<rect
						x = {xScale(click.col)}
						y = {yScale(click.row)}
						height = {clicksObject.rectHeight}
						width = {clicksObject.rectWidth}
						fill = {colorScale(click.count)}
						data-col = {click.col}
						stroke = "white"
						strokeWidth = "1"
					/>
					<text x = {xScale(click.col)} y = {yScale(click.row) + 20}>
						<tspan x = {xScale(click.col) + 30} y = {yScale(click.row) + 20} className = {style.countText}>{totalClicks ? Number((click.count / totalClicks) * 100) < 1 ? '<1%' : Number((click.count / totalClicks) * 100).toFixed(1) + '%' : '0%'}</tspan>
					</text>
				</g>
			)
    })

		return (
			<div className = {style.HOCSvgWrapper} ref = {size => this.size = size}>
				<select className = {style.selectOption} onChange = {this.props.removeGraph}>
					<option selected>Select Option</option>
					<option>Close</option>
				</select>
				<svg className = {style.HOCSvg}>
					{heatmap}
				</svg>
			</div>
		)
	}
}

export default HOCHeat
