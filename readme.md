react-heat-wrapper
=========

A small, React higher-order component which takes any react component as an argument, and allows the user to track which elements were clicked, from which websites clicks came from, and finally to see a heatmap overlayed on the component of click data.

## Installation

  `npm install react-heat-wrapper`

## Usage

    var Wrapper = require('react-heat-wrapper');

    Wrapper take a user-created api-endpoint to persist clicks data as the first argument. This endpoint should consist of a 'get' and 'post' route.

    The post route should be configured to be able to handle a req.body in this format: {
				x: e.pageX,
				y: e.pageY,
				clientwidth: window.innerWidth,
				clientheight: window.innerHeight,
				referrer: document.referrer,
				page: window.location.pathname,
			}


    The get route should be identical to the post route, and should return a json object in the same format as the req.body

    The second argument of wrapper is a numerical id given to differentiate between other wrapped components.

    Finally, the Wrapper function returns another function that takes the component to be wrapped and tracked as its argument.

    Ex.
    let wrappedComponent = Wrapper('api/clicks', 1)(componentToWrap)

    To activate the heatmap, type 'viewHeatMap(id)' in the console, and select from the options that appear to the top left of your wrapped component.


## Tests

  `npm test`
