/*
 * Copyright 2003-2006, 2009, 2017, United States Government, as represented by the Administrator of the
 * National Aeronautics and Space Administration. All rights reserved.
 *
 * The NASAWorldWind/WebWorldWind platform is licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
/**
 * Illustrates how to display and pick Polygons.
 */
requirejs(['./WorldWindShim',
        './LayerManager'
    ],
    function(WorldWind,
        LayerManager) {
        "use strict";

        // Tell WorldWind to log only warnings and errors.
        WorldWind.Logger.setLoggingLevel(WorldWind.Logger.LEVEL_WARNING);

        // Create the WorldWindow.
        var wwd = new WorldWind.WorldWindow("canvasOne");

        // Create and add layers to the WorldWindow.
        var layers = [
            // Imagery layers.
            { layer: new WorldWind.BMNGLayer(), enabled: true },
            { layer: new WorldWind.BMNGLandsatLayer(), enabled: false },
            { layer: new WorldWind.BingAerialWithLabelsLayer(null), enabled: true },
            // WorldWindow UI layers.
            { layer: new WorldWind.CompassLayer(), enabled: true },
            { layer: new WorldWind.CoordinatesDisplayLayer(wwd), enabled: true },
            { layer: new WorldWind.ViewControlsLayer(wwd), enabled: true }
        ];

        for (var l = 0; l < layers.length; l++) {
            layers[l].layer.enabled = layers[l].enabled;
            wwd.addLayer(layers[l].layer);
        }

        // Create a layer to hold the polygons.
        var polygonsLayer = new WorldWind.RenderableLayer();
        polygonsLayer.displayName = "Polygons";

        // Add the path to a layer and the layer to the WorldWindow's layer list.
        var pathsLayer = new WorldWind.RenderableLayer();
        pathsLayer.displayName = "Paths";

        var height = 1e4;

        var precision = $("#levelSelect");
        for (var i = 1; i <= 4; i++) {
            var precItem = $('<a class="list-group-item list-group-item-action" >' + i + '</a>');
            precision.append(precItem);
            if (i == 2) {
                precItem.addClass("active");
            }
        }

        var level_select = $("#levelSelect a.active").text();
        var dataSource = "/examples/data/s2level" + level_select + "_cells.json";
        $("#levelSelect a").on('click', function() {
            $(this).siblings().removeClass('active');
            $(this).addClass('active');
            level_select = $("#levelSelect a.active").text();
            dataSource = "/examples/data/s2level" + level_select + "_cells.json";
            pathsLayer.removeAllRenderables();
            polygonsLayer.removeAllRenderables();
            loadData();
            wwd.redraw();
        });
        var loadData = function() {
            var httpRequest = new XMLHttpRequest();
            httpRequest.onreadystatechange = function() {
                if (httpRequest.readyState === XMLHttpRequest.DONE) {
                    // Everything is good, the response was received.
                    if (httpRequest.status === 200) {
                        // Perfect!
                        var response = httpRequest.response;
                        var level = response['level'];
                        var ncells = response['ncells'];
                        var points = response['points'];
                        console.log("Level:", level);

                        for (var i = 0, cur = 0; i < ncells; i++) {
                            var boundary = [];
                            boundary.push(new WorldWind.Position(points[cur][0], points[cur][1], height));
                            boundary.push(new WorldWind.Position(points[cur + 1][0], points[cur + 1][1], height));
                            boundary.push(new WorldWind.Position(points[cur + 2][0], points[cur + 2][1], height));
                            boundary.push(new WorldWind.Position(points[cur + 3][0], points[cur + 3][1], height));
                            cur += 4;

                            var path = new WorldWind.Path(boundary, null);
                            path.altitudeMode = WorldWind.RELATIVE_TO_GROUND;
                            path.followTerrain = true;
                            path.extrude = true;
                            path.useSurfaceShapeFor2D = true;

                            var colors = [WorldWind.Color.WHITE, WorldWind.Color.RED, WorldWind.Color.BLUE, WorldWind.Color.GREEN];
                            // Create and assign the path's attributes.
                            var pathAttributes = new WorldWind.ShapeAttributes(null);
                            // var imod4 = i % 4;
                            // pathAttributes.outlineColor = colors[imod4];
                            pathAttributes.outlineColor = WorldWind.Color.WHITE;
                            pathAttributes.interiorColor = new WorldWind.Color(0, 1, 1, 0.5);
                            pathAttributes.drawVerticals = path.extrude; //Draw verticals only when extruding.
                            path.attributes = pathAttributes;
                            pathsLayer.addRenderable(path);

                            var polygonAttributes = new WorldWind.ShapeAttributes(null);
                            polygonAttributes.interiorColor = WorldWind.Color.WHITE;
                            polygonAttributes.drawVerticals = true;
                            polygonAttributes.applyLighting = true;

                            // Create the polygon and assign its attributes.
                            var polygon = new WorldWind.Polygon([boundary], null);
                            polygon.altitudeMode = WorldWind.ABSOLUTE;
                            polygon.extrude = polygonAttributes.drawVerticals;
                            polygon.attributes = polygonAttributes;
                            // Add the polygon to the layer and the layer to the WorldWindow's layer list.
                            polygonsLayer.addRenderable(polygon);
                        }
                    } else {
                        // There was a problem with the request.
                        // For example, the response may have a 404 (Not Found)
                        // or 500 (Internal Server Error) response code.
                        console.log('response status:', httpRequest.status);
                    }
                } else {
                    // Not ready yet.
                }
            };
            httpRequest.open('GET', dataSource, true);
            httpRequest.responseType = 'json';
            httpRequest.send();
        };

        loadData();
        wwd.addLayer(pathsLayer);
        polygonsLayer.enabled = false;
        wwd.addLayer(polygonsLayer);
        wwd.redraw();

        // Now set up to handle highlighting.
        var highlightController = new WorldWind.HighlightController(wwd);

        // Create a layer manager for controlling layer visibility.
        var layerManager = new LayerManager(wwd);

    });