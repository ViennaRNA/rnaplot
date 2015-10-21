function rnaPlot() {
    var options = {
        "width": 400,
        "height": 400,
        "nucleotideRadius": 5,
        "rnaEdgePadding": 0,     // how far the leftmost, rightmost, topmost and bottomost
                                // nucleotides are from the edge of the plot
        "labelInterval": 0,
        "showNucleotideLabels": true,
        "startNucleotideNumber": 1,
        "bundleExternalLinks": false
    };

    var xScale, yScale;

    function createTransformToFillViewport(xValues, yValues) {
        // create transform that will scale the x and y values so that
        // they fill the available viewport
    
        // find out leftmost, rightmost, topmost, bottommost positions of each
        // nucleotide so that we can create a scale
        var xExtent = d3.extent(rg.nodes.map(function(d) { return d.x; })) 
        var yExtent = d3.extent(rg.nodes.map(function(d) { return d.y; })) 

        var NAME_OFFSET = 30;
        if (rg.name != '')
            yExtent[1] += NAME_OFFSET;

        // add the radius of the nucleotides
        xExtent[0] -= options.nucleotideRadius + options.rnaEdgePadding;
        yExtent[0] -= options.nucleotideRadius + options.rnaEdgePadding;

        xExtent[1] += options.nucleotideRadius + options.rnaEdgePadding;
        yExtent[1] += options.nucleotideRadius + options.rnaEdgePadding;

        // find out how wide and height the molecule
        var xRange = xExtent[1] - xExtent[0];
        var yRange = yExtent[1] - yExtent[0];

        // how much wider / taller is it than the available viewport
        var xExtra = xRange - options.width;
        var yExtra = yRange - options.height;

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
            .range([0, options.width])

            ret = createOtherScale(xScale, yExtent, [0, options.height]);
            yScale = ret.scale;
        } else {
            // we have to shrink more in the x-dimension than the y
            yScale = d3.scale.linear()
            .domain(yExtent)
            .range([0, options.height])

            ret = createOtherScale(yScale, xExtent, [0, options.width]);
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

        if (options.showNucleotideLabels) {
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
        .classed('number-label', true);
    }

    function createName(selection, name) {
        selection.append('svg:text')
        .attr('transform', 'translate(' + xScale.invert(options.width / 2) + ',' + yScale.invert(options.height) + ')')
        .attr('dy', -10)
        .classed('rna-name', true)
        .text(name);
    }

    function makeExternalLinksBundle(links) {
        var nodesDict = {};
        var linksList = [];
        console.log('links:', links);
        //links = links.filter(function(d) { return d.linkType == 'external'; });

        for (var i = 0; i < links.length; i++) {
            nodesDict[links[i].source.uid] = links[i].source;
            nodesDict[links[i].target.uid] = links[i].target;

            linksList.push({'source': links[i].source.uid, "target": links[i].target.uid}) ;
        }

        var fbundling = d3.ForceEdgeBundling().nodes(nodesDict).edges(linksList);
        var results   = fbundling();

        console.log('nodesDict:', nodesDict);
        console.log('linksList:', linksList);
        console.log('results:', results);
    }

    function createLinks(selection, links) {
        links = links.filter(function(d) { return d.source !== null && d.target !== null; });
        var gs = selection.selectAll('.rna-link')
        .data(links)
        .enter()
        .append('svg:line')
        .attr('x1', function(d) { return d.source.x; })
        .attr('x2', function(d) { return d.target.x; })
        .attr('y1', function(d) { return d.source.y; })
        .attr('y2', function(d) { return d.target.y; })
        .attr('link-type', function(d) { return d.linkType; })
        .classed('rna-link', true);
    }

    function chart(selection) {
        selection.each(function(data) {
            // data should be a dictionary containing at least a structure
            // and possibly a sequence
            rg = new RNAGraph(data.sequence, data.structure, data.name)
                    .recalculateElements()
                    .elementsToJson()
                    .addName(data.name);

            data.rnaGraph = rg;
            // calculate the position of each nucleotide
            // the positions of the labels will be calculated in
            // the addLabels function
            var positions = simpleXyCoordinates(rg.pairtable);
            rg.addPositions('nucleotide', positions)
            .reinforceStems()
            .reinforceLoops()
            .addExtraLinks(data.extraLinks)
            .addLabels(options.startNucleotideNumber, options.labelInterval);

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

            var links = rg.links;

            if (options.bundleExternalLinks) {
                makeExternalLinksBundle(links); 
            }

            createLinks(gTransform, links);
            createNucleotides(gTransform, nucleotideNodes);            
            createLabels(gTransform, labelNodes);
            createName(gTransform, data.name);

        });
    }

    chart.width = function(_) {
        if (!arguments.length) return options.width;
        options.width = _;
        return chart;
    };

    chart.height = function(_) {
        if (!arguments.length) return options.height;
        options.height = _;
        return chart;
    };

    chart.showNucleotideLabels = function(_) {
        if (!arguments.length) return options.showNucleotideLabels;
        options.showNucleotideLabels = _;
        return chart;
    };

    chart.rnaEdgePadding = function(_) {
        if (!arguments.length) return options.rnaEdgePadding;
        options.rnaEdgePadding = _;
        return chart;
    };

    chart.nucleotideRadius = function(_) {
        if (!arguments.length) return options.nucleotideRadius;
        options.nucleotideRadius = _;
        return chart;
    };

    chart.labelInterval = function(_) {
        if (!arguments.length) return options.labelInterval;
        options.labelInterval = _;
        return chart;
    };

    chart.showNucleotideLabels = function(_) {
        if (!arguments.length) return options.showNucleotideLabels;
        options.showNucleotideLabels = _;
        return chart;
    };

    chart.startNucleotideNumber = function(_) {
        if (!arguments.length) return options.startNucleotideNumber;
        options.startNucleotideNumber = _;
        return chart;
    };

    chart.bundleExternalLinks = function(_) {
        if (!arguments.length) return options.bundleExternalLinks;
        options.bundleExternalLinks = _;
        return chart;
    };

    return chart;
}
