function rnaPlot() {
    var width = 400,
    height = 400,
    labelInterval = 0,
    startNucleotideNumber = 1,
    transitionLength = 0,
    uids = [];

    function addNucleotideNames(selection, rnaGraph) {
        // the labels for each nucleotide
    }

    function chart(selection) {
        console.log('selection', selection)
        selection.each(function(data) {
            console.log('data', data)
            // data should be a dictionary containing at least a structure
            // and possibly a sequence
            rg = new RNAGraph(data.sequence, data.structure, data.name)
                    .recalculateElements()
                    .elementsToJson();
            var positions;
            var origRadius = 5;

            positions = simple_xy_coordinates(rg.pairtable);

            rg.addPositions('nucleotide', positions)
            .addLabels(startNucleotideNumber, labelInterval);

            // find out leftmost, rightmost, topmost, bottommost positions of each
            // nucleotide so that we can create a scale
            var xExtent = d3.extent(rg.nodes.map(function(d) { return d.x; })) 
            var yExtent = d3.extent(rg.nodes.map(function(d) { return d.y; })) 

            // add the radius of the nucleotides
            xExtent[0] -= origRadius;
            yExtent[0] -= origRadius;

            xExtent[1] += origRadius;
            yExtent[1] += origRadius;

            // find out how wide and heigh the molecule
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

                return {"scaleFactor": scaleFactor, 
                        "scale": d3.scale.linear()
                                         .domain(newDomain)
                                         .range([newRange[0] + newMargin, newRange[1] - newMargin])};
            }

            var ret;

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

            //scale the size of the individual nucleotides
            var newRadius = origRadius * ret.scaleFactor;
            var gs = d3.select(this)
            .selectAll('.rnaBase')
            .data(rg.nodes)
            .enter()
            .append('svg:g')
            .attr('transform', function(d) { 
                return 'translate(' + xScale(d.x) + ',' + yScale(d.y) + ')'; 
            });

            var circles = gs.append('svg:circle')
            .attr('r', newRadius)
            .classed('rnaBase', true)

            addNucleotideNames(gs, rg);
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

    return chart;
}
