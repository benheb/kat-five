(function(window){
  'use strict';

  var App = function App( options ) {
    console.log('init KAT5, options: ', options);
    var self = this;

    //store options 
    this.options = options;
    this._isAnimating = true;

    this.wireScrollTricks();
    this.initTrackMap();
    this.initPopulationMap();
    this.initOrleansChart();
    this.initPeopleChart();
    this.initHomesChart();
    this.initMajorCanes();
    this.initJobsCharts();
    this.wire();
  }




  App.prototype.wireScrollTricks = function() {
    var self = this;
    var scrollTop;
    $(window).scroll(function(e) {
      scrollTop = $(window).scrollTop();
      
      if ( scrollTop >= 10 ) {
        //$('#section-intro').css({'-webkit-filter':'none'});
      } else if ( scrollTop < 10 ) {
        //$('#section-intro').css({'-webkit-filter':'grayscale(100%)'});
      }
    });

    
    var offset = $(window).height() / 1.5;
    var waypoint = new Waypoint({
      element: document.getElementById('major-canes-map'),
      handler: function(direction) {
        if ( direction === 'down' ) {
          self.zoomGlobe();
        }
      },
      offset: offset
    });

    var waypoint = new Waypoint({
      element: document.getElementById('major-canes-map'),
      handler: function(direction) {
        if ( direction === 'up' ) {
          self.resetGlobe();
        }
      },
      offset: $(window).height()
    });

  }



   App.prototype.initMajorCanes = function() {
    var self = this;
    var margin = {top: 10, left: 0, bottom: 10, right: 0}
      , width = parseInt(d3.select('#katrina-track-map').style('width'))
      , width = width - margin.left - margin.right
      , mapRatio = .5
      , height = width * mapRatio;
    
    console.log('width:', width);
    console.log('height:', height);

    $('#map-overlay').css({'height': height + 'px'});

    var windScale = d3.scale.quantile()
      .domain([0, 140])
      .range(colorbrewer.YlOrRd[9]);
    
    this.majorProjection = d3.geo.orthographic()
      .scale(325)
      .translate([width / 2, height / 2])
      .clipAngle(90)
      .rotate([-50, -20])
      .precision(.1);


    this.majorPath = d3.geo.path()
      .projection(this.majorProjection);

    this.majorSvg = d3.select("#major-canes-map").append("svg")
        .attr("width", width)
        .attr("height", height);

    var λ = d3.scale.linear()
    .domain([0, width])
    .range([-180, 180]);

    var φ = d3.scale.linear()
        .domain([0, height])
        .range([90, -90]);

    queue()
      .defer(d3.json, "data/world.json")
      .defer(d3.json, "data/us.json")
      .defer(d3.json, "data/hurricane-2004.json")
      .defer(d3.json, "data/hurricane-2005.json")
      .await(ready);

    function ready(error, world, states, hurricane, hurricane2) {
      if (error) throw error;
      console.log('world', world, 'states', states, 'hurricane', hurricane);
      
      self.majorSvg.append("defs").append("path")
        .datum({type: "Sphere"})
        .attr("id", "sphere")
        .attr("d", self.majorPath);

      self.majorSvg.append("use")
        .attr("class", "fill-ocean")
        .attr("xlink:href", "#sphere");

      self.majorSvg.append("g")
          .attr("class", "major-states")
        .selectAll("path")
          .data(topojson.feature(world, world.objects.ne_110m_land).features)
        .enter().append("path")
          .attr('class', 'state')
          .attr("d", self.majorPath);

      self.majorSvg.append("g")
          .attr("class", "major-states")
        .selectAll("path")
          .data(topojson.feature(states, states.objects.states).features)
        .enter().append("path")
          .attr('class', 'state')
          .attr("d", self.majorPath);


      self.majorSvg.append("g").selectAll("path")
        .data(topojson.feature(hurricane, hurricane.objects['2004hur']).features)
      .enter().append("path")
        .attr("class", "hurricane")
        .attr('opacity', function(d) {
          if ( d.properties.Name === 'IVAN' || d.properties.Name === 'CHARLEY' || d.properties.Name === 'JEANNE') {
            return 1;
          } else {
            return 0;
          }
        })
        .attr("stroke", function(d) {
          if ( d.properties.basin === "NA" ) {
            if ( d.properties.ATC_wind < 64 ) {
              return "#3498db";
            } else if ( d.properties.ATC_wind > 64 && d.properties.ATC_wind < 82 ) {
              return "#f1c40f";
            } else if ( d.properties.ATC_wind >= 82 && d.properties.ATC_wind < 95 ) {
              return "#f39c12";
            } else if ( d.properties.ATC_wind >= 95 && d.properties.ATC_wind < 112 ) {
              return "#e67e22";
            } else if ( d.properties.ATC_wind >= 112 && d.properties.ATC_wind < 136 ) {
              return "#d35400";
            } else if ( d.properties.ATC_wind >= 136 ) {
              return "#c0392b";
            }
          } else {
            return "rgb(0, 194, 255)";
          }
          
        })
        .attr("d", self.majorPath);


      self.majorSvg.append("g").selectAll("path")
        .data(topojson.feature(hurricane2, hurricane2.objects['2005hur']).features)
      .enter().append("path")
        .attr("class", "hurricane")
        .attr('opacity', function(d) {
          if ( d.properties.Name === 'KATRINA' || d.properties.Name === 'DENNIS' || d.properties.Name === 'WILMA' || d.properties.Name === 'RITA' ) {
            return 1;
          } else {
            return 0;
          }
        })
        .attr("stroke", function(d) {
          if ( d.properties.basin === "NA" ) {
            if ( d.properties.ATC_wind < 64 ) {
              return "#3498db";
            } else if ( d.properties.ATC_wind > 64 && d.properties.ATC_wind < 82 ) {
              return "#f1c40f";
            } else if ( d.properties.ATC_wind >= 82 && d.properties.ATC_wind < 95 ) {
              return "#f39c12";
            } else if ( d.properties.ATC_wind >= 95 && d.properties.ATC_wind < 112 ) {
              return "#e67e22";
            } else if ( d.properties.ATC_wind >= 112 && d.properties.ATC_wind < 136 ) {
              return "#d35400";
            } else if ( d.properties.ATC_wind >= 136 ) {
              return "#c0392b";
            }
          } else {
            return "rgb(0, 194, 255)";
          }
          
        })
        .attr("d", self.majorPath);

    }


    d3.select(self.frameElement).style("height", height + "px");
  }



  App.prototype.zoomGlobe = function() {
    var self = this;
    var step = 20;
    var scale = 325;

    d3.transition()
      .duration(3000)
      .tween("rotate", function() {
        var r = d3.interpolate(self.majorProjection.rotate(), [70, -20]);
        return function(t) {
          //console.log('t', t);
          self.majorProjection.rotate(r(t));
          self.majorProjection.scale(scale + step);
          self.majorSvg.selectAll("path").attr("d", self.majorPath);
          scale = scale + step;
        };
      })
  }



  App.prototype.resetGlobe = function() {
    var self = this;
    console.log('reset globe');
    self.majorProjection.rotate([-50, -20]);
    self.majorProjection.scale(325);
    self.majorSvg.selectAll("path").attr("d", self.majorPath);
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

    $('#map-overlay').css({'height': height + 'px'});

    var colors = ["#3498db", "#f1c40f", "#f39c12", "#e67e22", "#d35400", "#c0392b"];

    var windScale = d3.scale.quantile()
      .domain([30, 150])
      .range(colors);
      //.range(colorbrewer.YlOrRd[9]);
    
    this.trackProjection = d3.geo.conicConformal()
      .rotate([80, 0])
      .center([0, 28])
      .parallels([29.5, 45.5])
      .scale(1200)
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
      .defer(d3.json, "data/hurricane-2005.json")
      .await(ready);

    function ready(error, world, states, tracks, majors) {
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

      self.trackSvg.append("g").selectAll("path")
        .data(topojson.feature(majors, majors.objects['2005hur']).features)
      .enter().append("path")
        .attr("class", "hurricane")
        .attr('opacity', function(d) {
          if ( d.properties.Name === 'KATRINA') {
            return 1;
          } else {
            return 0;
          }
        })
        .attr("stroke", function(d) {
          return windScale(d.properties.ATC_wind);
        })
        .attr("d", self.trackPath);

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
        });
      
      //self._animateTrack();


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
          return windScale(d.properties['Wind(WMO)']);
        })
        .on("mouseenter", function(d) {
          self._isAnimating = false;
          d3.select(this)
            .transition()
            .duration(500)
            .attr('r', function(d) {
              return d.properties['Wind(WMO)'] / 5;
            });

          self._trackInfo(d);
        })
        .on("mouseleave", function(d) {
          d3.select(this)
            .transition()
            .duration(500)
            .attr('r', function(d) {
              return d.properties['Wind(WMO)'] / 10;
            });

          $('#track-infowin').hide();

          self._isAnimating = true;
          setTimeout(function() {
            console.log('self._isAnimating', self._isAnimating);
            if ( self._isAnimating ) {
              self._animateTrack();
            }
          },1000);
        });
        
        setTimeout(function() {
          self._animateTrack();
        },2500);


    }

    d3.select(self.frameElement).style("height", height + "px");
  }




  App.prototype._animateTrack = function() {
    var self = this;
    
    if ( this._isAnimating ) {
      d3.selectAll('.track')
        .attr('r', 0)
        .each(function(d, i) {
          d3.select(this)
            .transition()
            .delay( 180 * i )
            .duration(3000)
            .attr('r', function(d) {
              return d.properties['Wind(WMO)'] / 10;
            })
            .each('start', function(d) {
              $('#report-date').html(d.properties.ISO_time);
            });
          });

      var tick = 0; 
      d3.selectAll('.track-outer')
        .attr('r', 0)
        .each(function(d, i) {
          d3.select(this)
            .transition()
            .delay( 180 * i )
            .duration(3000)
            .attr('r', function(d) {
              return d.properties['Wind(WMO)'] / 2.5;
            })
            .each('end', function(f, o) {
              tick++; 
              if ( tick === 34 ) {
                $('#report-date').html('');
                if ( self._isAnimating ) {
                  setTimeout(function() {
                    d3.selectAll('.track')
                        .transition()
                        .duration(1000)
                        .attr('r', 0);
                    d3.selectAll('.track-outer')
                        .transition()
                        .duration(1000)
                        .attr('r', 0);
                  },2000);
                  setTimeout(function() {
                    self._animateTrack();
                  },3600);
                }
              }
            })
        });
    }
  }




  App.prototype._trackInfo = function(d) {
    var html;
    var x2 = this.trackProjection([d.geometry.coordinates[0],d.geometry.coordinates[1]])[0] + 84;
    var y2 = this.trackProjection([d.geometry.coordinates[0],d.geometry.coordinates[1]])[1] - 120;
    var date = d.properties.ISO_time;
    var wind = d.properties['Wind(WMO)'];
    var pressure = d.properties['Pres(WMO)'];

    html = '<div>\
        <div class="track-attr-title">Date: ' + date + '</div>\
        <div class="track-attr-title">Wind (WMO): ' + wind + '</div>\
        <div class="track-attr-title">Pressure (WMO): ' + pressure + '</div>\
      </div>';

    $('#track-infowin').show().html(html).css({'left' : (x2) + 'px', 'top' : (y2) + 'px'});

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
        ]
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

    var chart = c3.generate({
      bindto: '#homes-chart',
      size: {
        height: 250
      },
      bar: {
        width: 30
      },
      padding: {
        left: 90,
        right:20
      },
      color: {
        pattern: ['#FABF62', '#ACB6DD']
      },
      data: {
        x: 'x',
        columns: [
          ['x', 'Hurricane Katrina', 'Sandy', 'Hurricane Andrew', 'Galveston Hurricane'],
          ['Homes Damaged or Destroyed', 662758, 650000, 126495, 3500]
        ],

        type: 'bar',

        color: function(inColor, data) {
          var colors = ["#fbb4ae", "#b3cde3", "#ccebc5", "#decbe4"];//.reverse();
          if (data.index !== undefined) {
            return colors[data.index];
          }

          return inColor;
        }
      },
      axis: {
        rotated: true,
        x: {
          type: 'category'
        }
      },
      tooltip: {
        grouped: false
      },
      legend: {
        show: false
      }
    });
  }




  App.prototype.initJobsCharts = function() {
    queue()
      .defer(d3.csv, "data/new-orleans-jobs.csv")
      .await(ready);

    function ready(error, jobs) { 
      console.log('jobs', jobs);

      var unemployed = c3.generate({
        bindto: '#unemployment-rate',
        size: {
          height: 250
        },
        padding: {
          left: 40,
          right:30
        },
        data: {
          json: jobs,
          type: 'line',
          keys: {
            x: 'Year',
            value: ['unemployment_rate']
          }
        },
        color: {
          pattern: ['#34495e']
        },
        axis: {
          x: {
            type: 'category',
            tick: {
              count: 3
            }
          }
        }
      });

      var force = c3.generate({
        bindto: '#labor-force',
        size: {
          height: 250
        },
        padding: {
          left: 50,
          right:50
        },
        data: {
          json: jobs,
          type: 'line',
          keys: {
            x: 'Year',
            value: ['labor_force']
          }
        },
        color: {
          pattern: ['#34495e']
        },
        axis: {
          x: {
            type: 'category',
            tick: {
              count: 3
            }
          }
        }
      });

    };
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


    $('#animate-track').on('click', function() {
      self._animateTrack();
    });

  }


  window.App = App;

})(window);