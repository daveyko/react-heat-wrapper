react-heat-wrapper
=========

A React higher-order component which takes any react component as an argument, and allows the user to track which elements were clicked, from which websites clicks came from, and finally to see a heatmap overlayed on the component of click data.

## Installation

`npm install react-heat-wrapper --save`

##Github

www.github.com/daveyko/react-heat-wrapper

## Usage

var Wrapper = require('react-heat-wrapper');

*Model*

Initially, you need to set up your own model to store your click data with parameters as follows (this example shows setting up a model in sequelize for a postgres db):

```javascript
const Sequelize = require('sequelize')
const db = require('../db')


const Click = db.define('click', {
	x  : {
		type     : Sequelize.FLOAT,
		allowNull: false
	},
	y: {
		type: Sequelize.FLOAT,
		allowNull: false
	},
	clientwidth: {
		type: Sequelize.INTEGER,
		allowNull: false
	},
	clientheight: {
		type: Sequelize.INTEGER,
		allowNull: false
	},
	referrer: {
		type: Sequelize.STRING,
		set(val){
			if (val === '') this.setDataValue('referrer', 'n/a')
			else{
				this.setDataValue('referrer', val)
			}
		}
	},
	page: {
		type: Sequelize.STRING,
	},
	count: {
		type: Sequelize.INTEGER,
		defaultValue: 1
	}
})


module.exports = Click
```

Wrapper takes a user-created api-endpoint to persist clicks data as the first argument. This endpoint should consist of a 'get' and 'post' route.

The post route should be configured to be able to handle a req.body in this format:
  {
    x: e.pageX,
    y: e.pageY,
    clientwidth: window.innerWidth,
    clientheight: window.innerHeight,
    referrer: document.referrer,
    page: window.location.pathname,
  }


The get route should be identical to the post route, and should return a json object in the same format as the req.body

*Route*
The following is an example of routes set up using Express for routing and accessing postgres tables using Sequelize
```javascript

const router = require('express').Router()
const {Click} = require('../db/models')
module.exports = router


router.get('/', (req, res, next) => {
	Click.findAll()
		.then((clicks) => {
			res.json(clicks)
		})
		.catch(next)
})

router.post('/', (req, res, next) => {
	return Click.findOrCreate({
		where: {
			x: req.body.x,
			y: req.body.y,
			clientwidth: req.body.clientwidth,
			clientheight: req.body.clientheight,
			page: req.body.page,
			referrer: req.body.referrer
		},
	}
	)
		.spread((clickInstance, created) =>{
			if (!created){
				return clickInstance.update({count: clickInstance.count + 1})
			} else {
				return clickInstance
			}
		}
		)
		.then((result) => {
			res.json(result)
		})
		.catch(next)
})

```
The second argument of wrapper is a numerical id given to differentiate between other wrapped components.

Finally, the Wrapper function returns another function that takes the component to be wrapped and tracked as its argument.

*SETUP*

let wrappedComponent = Wrapper('api/clicks', 1)(componentToWrap)

To activate the heatmap, type 'viewHeatMap(id)' in the console, and select from the options that appear to the top left of your wrapped component.


## Demo
view demo at:
www.github.com/daveyko/react-heat-wrapper

<br />
<p align="center">
  <img src="heat.gif" height="300">
</p>
<br />


