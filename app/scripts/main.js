(function(window){
  'use strict';

  var App = function App( options ) {
    console.log('init KAT5, options: ', options);
    var self = this;

    //store options 
    this.options = options;

    this.initTrackMap();
    this.initPopulationMap();
    this.initOrleansChart();
    this.initPeopleChart();
    //this.initHomesChart();
    this.wire();
  }




  App.prototype.initTrackMap = function() {
    var self = this;
    var margin = {top: 10, left: 0, bottom: 10, right: 0}
      , width = parseInt(d3.select('#katrina-track-map').style('width'))
      , width = width - margin.left - margin.right
      , mapRatio = .5
      , height = width * mapRatio;
    
    console.log('width:', width);
    console.log('height:', height);

    var windScale = d3.scale.quantile()
      .domain([0, 140])
      .range(colorbrewer.YlOrRd[9]);
    
    this.trackProjection = d3.geo.conicConformal()
    .rotate([80, 0])
    .center([0, 28])
    .parallels([29.5, 45.5])
    .scale(1000)
    .translate([width / 2, height / 2])
    .precision(.1);


    this.trackPath = d3.geo.path()
      .projection(this.trackProjection)
      .pointRadius(function(d) { return d.properties['Wind(WMO)'] / 10; });

    this.trackSvg = d3.select("#katrina-track-map").append("svg")
        .attr("width", width)
        .attr("height", height);

    queue()
      .defer(d3.json, "data/world-50.json")
      .defer(d3.json, "data/us.json")
      .defer(d3.json, "data/katrina-track.json")
      .await(ready);

    function ready(error, world, states, tracks) {
      if (error) throw error;
      console.log('world', world, 'states', states);

      self.trackSvg.append("g")
          .attr("class", "states")
        .selectAll("path")
          .data(topojson.feature(world, world.objects.ne_50m_land).features)
        .enter().append("path")
          .attr('class', 'state')
          .attr("d", self.trackPath);

      self.trackSvg.append("g")
          .attr("class", "states")
        .selectAll("path")
          .data(topojson.feature(states, states.objects.states).features)
        .enter().append("path")
          .attr('class', 'state')
          .attr("d", self.trackPath);

      // add circles to svg
      console.log('tracks: ', tracks);

      self.trackSvg.selectAll("circle")
        .data(tracks.features)
      .enter().append("circle")
        .attr("r", 0)
        .attr('class', 'track-outer')
        .attr("transform", function(d) {
          return "translate(" + self.trackProjection([
            d.geometry.coordinates[0],
            d.geometry.coordinates[1]
          ]) + ")";
        })
        .transition()
        .duration(5000)
        .attr('r', function(d) {
          return d.properties['Wind(WMO)'] / 3;
        });


      self.trackSvg.selectAll("circle.inner")
        .data(tracks.features)
      .enter().append("circle")
        .attr("r", 0)
        .attr('class', 'track')
        .attr("transform", function(d) {
          return "translate(" + self.trackProjection([
            d.geometry.coordinates[0],
            d.geometry.coordinates[1]
          ]) + ")";
        })
        .attr('fill', function(d) {
          console.log(windScale(d.properties['Wind(WMO)']), d.properties['Wind(WMO)']);
          return windScale(d.properties['Wind(WMO)']);
        })
        .transition()
        .duration(5000)
        .attr('r', function(d) {
          return d.properties['Wind(WMO)'] / 15;
        });


    }

    d3.select(self.frameElement).style("height", height + "px");
  }




  App.prototype.initPopulationMap = function() {
    var self = this;
    var margin = {top: 10, left: 10, bottom: 10, right: 10}
      , width = parseInt(d3.select('#county-map').style('width'))
      , width = width - margin.left - margin.right
      , mapRatio = .5
      , height = width * mapRatio;
    
    console.log('width:', width);
    console.log('height:', height);
    this.years = {
      year01: d3.map(),
      year02: d3.map(),
      year03: d3.map(),
      year04: d3.map(),
      year05: d3.map(),
      year06: d3.map(),
      year07: d3.map(),
      year08: d3.map(),
      year09: d3.map(),
      year10: d3.map()
    }

    this.popChange = {
      year01: d3.map(),
      year02: d3.map(),
      year03: d3.map(),
      year04: d3.map(),
      year05: d3.map(),
      year06: d3.map(),
      year07: d3.map(),
      year08: d3.map(),
      year09: d3.map(),
      year10: d3.map()
    }

    this.o = d3.scale.quantile()
        .domain([0, 100])
        .range(colorbrewer.Oranges[9]);

    this.b = d3.scale.quantile()
        .domain([100, 130])
        .range(colorbrewer.Blues[9]);

    this.projection = d3.geo.albersUsa()
      .scale(width)
      .translate([width / 2, height / 2]);

    this.path = d3.geo.path()
      .projection(this.projection);

    this.svg = d3.select("#county-map").append("svg")
        .attr("width", width)
        .attr("height", height);

    queue()
      .defer(d3.json, "data/us-detail.json")
      .defer(d3.json, "data/us.json")
      .defer(d3.csv, "data/pop-2000-2010.csv", function(d) { 
        
        if ( d.SEX === "0" && d.ORIGIN === "0" && d.RACE === "0" ) {
          //console.log('d.county', d.COUNTY);
          for ( var i = 1; i<=10; i++ ) {
            var plus = ( i !== 10 ) ? '0' : '';
            var val = d['POPESTIMATE20'+plus+i] / d['POPESTIMATE200'+(i-1)];
            var popChange = d['POPESTIMATE20'+plus+i] - d['POPESTIMATE200'+(i-1)];

            var q = 'year'+plus+i;
            self.years[q].set(d.STATE + d.COUNTY, +val);
            self.popChange[q].set(d.STATE + d.COUNTY, +popChange);
          }
        }
        
      })
      .await(ready);

    function ready(error, us, states) {
      if (error) throw error;

      console.log('us', us, 'states', states);

      self.svg.append("g")
          .attr("class", "counties")
        .selectAll("path")
          .data(topojson.feature(us, us.objects.UScounties).features)
        .enter().append("path")
          .attr('class', 'county')
          .style("fill", function(d) { 
            var area = self.path.area(d);

            var cnty = d.properties.STATE_FIPS + d.properties.CNTY_FIPS;
            var a = self.years['year06'].get(d.properties.STATE_FIPS + d.properties.CNTY_FIPS);
            var c = self.popChange['year06'].get(d.properties.STATE_FIPS + d.properties.CNTY_FIPS);
            var b = a * 100;
            if ( b < 97 ) {
              console.log('b', b);
              if ( c < -3000 ) {
                return self.o(b);
              } else {
                return '#FFF';
              }
            } else if ( b > 103 ) {
              if ( c > 3000 ) {
                return self.b(b);
              } else {
                return '#FFF';
              }
            } else {
              return '#FFF';
            }
          })
          .attr("d", self.path);
    }

    d3.select(self.frameElement).style("height", height + "px");
  }





  App.prototype.initOrleansChart = function() {
    var chart = c3.generate({
      bindto: '#orleans-pop-chart',
      data: {
          x: 'x',
          columns: [
              ['x', 2000, 2001, 2002, 2003, 2004, 2005, 2006, 2007, 2008, 2009, 2010, 2011, 2012, 2013, 2014],
              ['Orleans Parish Population', 485610, 487363, 489722, 492187,493765,494294,230172,268751,301842,327803, 347858,360877, 370167, 379006, 384320]
          ],
          labels: {
            format: function (v, id, i, j) {
              // it's possible to set for each data
              console.log(v, id, i, j);

            }
          }
      }
    });

  }




  App.prototype.initPeopleChart = function() {
    var chart = c3.generate({
      bindto: '#human-age-chart',
      data: {
        columns: [
          ['White', 0, 5, 15, 38, 54, 43, 247],
          ['Black', 10, 13, 31, 78, 80, 85, 198]
        ],
        type: 'bar',
        colors: {
          White: '#c0b3bc',
          Black: '#a5cdb3'
        },
        groups: [
            ['White', 'Black']
        ]
      },
      axis: {
        x: {
          type: 'category',
          categories: ['<18', '18-29', '30-44', '44-54', '55-64', '65-74', '>=74']
        }
      }
    });
  }




  App.prototype.initHomesChart = function() {
    var html;
    for( var i = 0; i<=35000; i++ ) {
      html = '<span class="home-point"></span>';
      $('#homes-chart').append(html);
    }
  }





  App.prototype.resize = function() {

    // adjust things when the window size changes
    var margin = {top: 10, left: 10, bottom: 10, right: 10};
    var mapRatio = .5;
    var width = parseInt(d3.select('#county-map').style('width'));
    var width = width - margin.left - margin.right;
    var height = width * mapRatio;

    // update projection
    this.projection
      .translate([width / 2, height / 2])
      .scale(width);

    // resize the map container
    this.svg
      .style('width', width + 'px')
      .style('height', height + 'px');

    // resize the map
    this.svg.selectAll('.county').attr('d', this.path);
  }


  App.prototype.wire = function() {
    var self = this; 

    d3.select(window).on('resize', function() {
      self.resize()
    });

  }


  window.App = App;

})(window);