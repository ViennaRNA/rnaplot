function rnaPlot() {
    var width = 400,
    height = 400,
    labelInterval = 0,
    startNucleotideNumber = 1,
    transitionLength = 0,
    showNucleotideLabels = true,
    uids = [];

    var options = {
        "nucleotideRadius": 5,
        "rnaEdgePadding": 0     // how far the leftmost, rightmost, topmost and bottomost
                                // nucleotides are from the edge of the plot
    };

    function createTransformToFillViewport(xValues, yValues) {
        // create transform that will scale the x and y values so that
        // they fill the available viewport
    
        // find out leftmost, rightmost, topmost, bottommost positions of each
        // nucleotide so that we can create a scale
        var xExtent = d3.extent(rg.nodes.map(function(d) { return d.x; })) 
        var yExtent = d3.extent(rg.nodes.map(function(d) { return d.y; })) 

        console.log('xs:', rg.nodes.map(function(d) { return d.x; }));

        // add the radius of the nucleotides
        xExtent[0] -= options.nucleotideRadius + options.rnaEdgePadding;
        yExtent[0] -= options.nucleotideRadius + options.rnaEdgePadding;

        xExtent[1] += options.nucleotideRadius + options.rnaEdgePadding;
        yExtent[1] += options.nucleotideRadius + options.rnaEdgePadding;

        // find out how wide and height the molecule
        var xRange = xExtent[1] - xExtent[0];
        var yRange = yExtent[1] - yExtent[0];

        // how much wider / taller is it than the available viewport
        var xExtra = xRange - width;
        var yExtra = yRange - height;

        var xScale, yScale;

        // once we have a scale for one dimension, we can create the scale for the other
        // keeping the same expansion / shrinking ratio
        function createOtherScale(firstScale, newDomain, newRange) {
            var scaleFactor = (firstScale.range()[1] - firstScale.range()[0]) / 
                              (firstScale.domain()[1] - firstScale.domain()[0]);
            var newWidth = (newDomain[1] - newDomain[0]) * scaleFactor
            var newMargin = ((newRange[1] - newRange[0]) - newWidth) / 2;

            console.log('scaleFactor', scaleFactor);

            return {"scaleFactor": scaleFactor, 
                    "scale": d3.scale.linear()
                                     .domain(newDomain)
                                     .range([newRange[0] + newMargin, newRange[1] - newMargin])};
        }

        var ret;

        console.log('xRange:', xExtent, 'yRange:', yExtent);
        console.log('xExtra:', xExtra, 'yExtra:', yExtra);

        if (xExtra > yExtra) {
            // we have to shrink more in the x-dimension than the y
            xScale = d3.scale.linear()
            .domain(xExtent)
            .range([0, width])

            ret = createOtherScale(xScale, yExtent, [0, height]);
            yScale = ret.scale;
        } else {
            // we have to shrink more in the x-dimension than the y
            yScale = d3.scale.linear()
            .domain(yExtent)
            .range([0, height])

            ret = createOtherScale(yScale, xExtent, [0, width]);
            xScale = ret.scale;
        }

        var xOffset = xScale.range()[0] - xScale.domain()[0];
        var yOffset = yScale.range()[0] - yScale.domain()[0];

        return "translate(" + -(xScale.domain()[0] * ret.scaleFactor - xScale.range()[0]) + 
                  "," + -(yScale.domain()[0] * ret.scaleFactor - yScale.range()[0]) + ")" + 
            'scale(' + ret.scaleFactor + ')';
    }

    function createNucleotides(selection, nucleotideNodes) {
        // create groupings for each nucleotide and label
        var gs = selection
        .selectAll('.rna-base')
        .data(nucleotideNodes)
        .enter()
        .append('svg:g')
        .attr('transform', function(d) { 
            return 'translate(' + d.x + ',' + d.y + ')'; 
        });

        var circles = gs.append('svg:circle')
        .attr('r', options.nucleotideRadius)
        .classed('rna-base', true)

        if (showNucleotideLabels) {
            var nucleotideLabels = gs.append('svg:text')
            .text(function(d) { return d.name; })
            .attr('text-anchor', 'middle')
            .attr('dominant-baseline', 'central')
            .classed('nucleotide-label', true)
            .append('svg:title')
            .text(function(d) { return d.struct_name + ":" + d.num; });
        }
    }

    function createLabels(selection, labelNodes) {
        // create groupings for each nucleotide and label

        console.log('labelNodes', labelNodes)

        var gs = selection 
        .selectAll('.rnaLabel')
        .data(labelNodes)
        .enter()
        .append('svg:g')
        .attr('transform', function(d) { 
            return 'translate(' + d.x + ',' + d.y + ')'; 
        });

        var numberLabels = gs.append('svg:text')
        .text(function(d) { return d.name; })
        .attr('text-anchor', 'middle')
        .attr('font-weight', 'bold')
        .attr('dominant-baseline', 'central')
        .classed('number-label', true)
    }

    function chart(selection) {
        console.log('selection', selection)
        selection.each(function(data) {
            // data should be a dictionary containing at least a structure
            // and possibly a sequence
            console.log('data', data)
            rg = new RNAGraph(data.sequence, data.structure, data.name)
                    .recalculateElements()
                    .elementsToJson();

            data.rnaGraph = rg;
            // calculate the position of each nucleotide
            // the positions of the labels will be calculated in
            // the addLabels function
            var positions = simple_xy_coordinates(rg.pairtable);
            rg.addPositions('nucleotide', positions)
            .addLabels(startNucleotideNumber, labelInterval);

            // create a transform that will fit the molecule to the
            // size of the viewport (canvas, svg, whatever)
            var fillViewportTransform = createTransformToFillViewport(
                rg.nodes.map(function(d) { return d.x; }),
                rg.nodes.map(function(d) { return d.y; }));

            var gTransform = d3.select(this)
            .append('g')
            .attr('transform', fillViewportTransform);

            var nucleotideNodes = rg.nodes.filter(function(d) { 
                return d.nodeType == 'nucleotide'; 
            });

            var labelNodes = rg.nodes.filter(function(d) {
                return d.nodeType == 'label';
            });

            createNucleotides(gTransform, nucleotideNodes);            
            createLabels(gTransform, labelNodes);

        });
    }

    chart.width = function(_) {
        if (!arguments.length) return width;
        width = _;
        return chart;
    };

    chart.height = function(_) {
        if (!arguments.length) return height;
        height = _;
        return chart;
    };

    chart.labelInterval = function(_) {
        if (!arguments.length) return labelInterval;
        labelInterval = _;
        return chart;
    };

    chart.showNucleotideLabels = function(_) {
        if (!arguments.length) return showNucleotideLabels;
        showNucleotideLabels = _;
        return chart;
    }

    chart.rnaEdgePadding = function(_) {
        if (!arguments.length) return options.rnaEdgePadding;
        options.rnaEdgePadding = _;
        return chart;
    };

    chart.nucleotideRadius = function() {
        if (!arguments.length) return options.nucleotideRadius;
        options.nucleotideRadius = _;
        return chart;
    };

    return chart;
}
