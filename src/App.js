import React, {Component} from 'react';
import echarts from 'echarts';
import 'echarts/map/js/china';
import geoJson from 'echarts/map/json/china.json';
import {geoCoordMap} from "./geo";
import {Alert, Spin} from 'antd';
import "antd/dist/antd.css";

class App extends Component {
    constructor(props) {
        super(props);
        this.state = {}
    }

    componentDidMount() {

        /* var confirmedCount;//确诊人数
         var suspectedCount;//疑似人数
         var curedCount;//治愈人数
         var deadCount;//死亡人数
         var proinceData;//省份信息*/
        fetch('/api/viewData/getDataToday', {
            method: 'GET',
            mode: 'cors', // no-cors, *cors, same-origin
            cache: 'no-cache', // *default, no-cache, reload, force-cache, only-if-cached
            credentials: 'same-origin', // include, *same-origin, omit
            headers: {
                'Content-Type': 'application/json'
                // 'Content-Type': 'application/x-www-form-urlencoded',
            },
            redirect: 'follow', // manual, *follow, error
            referrerPolicy: 'no-referrer', // no-referrer, *client
            //body: JSON.stringify(data) // body data type must match "Content-Type" header
        }).then((response) => response.json())
            .then((result) => {
                if ('10000' === result.header.code) {
                    var data = result.body;

                    /*this.state.confirmedCount = data.confirmedCount;
                    this.state.suspectedCount = data.suspectedCount;
                    this.state.deadCount = data.deadCount;
                    this.state.curedCount = data.curedCount;
                    this.state.proinceData = data.areaDataList;*/

                    this.initalECharts();
                } else {
                    alert(result.header.message);
                }
                console.log('Success:', result.header);
                console.log('Success:', result.body);
            })
            .catch((error) => {
                alert(error);
            });
    }

    initalECharts() {
        var colors = [
            ["#1DE9B6", "#F46E36", "#04B9FF", "#5DBD32", "#FFC809", "#FB95D5", "#BDA29A", "#6E7074", "#546570", "#C4CCD3"],
            ["#37A2DA", "#67E0E3", "#32C5E9", "#9FE6B8", "#FFDB5C", "#FF9F7F", "#FB7293", "#E062AE", "#E690D1", "#E7BCF3", "#9D96F5", "#8378EA", "#8378EA"],
            ["#DD6B66", "#759AA0", "#E69D87", "#8DC1A9", "#EA7E53", "#EEDD78", "#73A373", "#73B9BC", "#7289AB", "#91CA8C", "#F49F42"],
        ];
        var mapData = [[]];
        for (var key in geoCoordMap) {
            mapData[0].push({
                "name": key,
                "value": 90
            });
        }
        echarts.registerMap('zhongguo', geoJson);
        var convertData = function (data) {
            var res = [];
            for (var i = 0; i < data.length; i++) {
                var geoCoord = geoCoordMap[data[i].name];
                if (geoCoord) {
                    res.push({
                        name: data[i].name,
                        value: geoCoord.concat(data[i].value)
                    });
                }
            }
            return res;
        };
        const optionXyMap01 = {
            timeline: {
                show: false
            },
            baseOption: {
                geo: {
                    map: 'china',
                    /*调整地图位置*/
                    center: [113.83531246, 34.0267395887],
                    /*控制鼠标放上去是否显示省份*/
                    label: {
                        emphasis: {
                            show: false
                        }
                    },
                    itemStyle: {
                        normal: {
                            borderColor: 'rgba(147, 235, 248, 1)',
                            borderWidth: 1,
                            areaColor: {
                                type: 'radial',
                                x: 0.5,
                                y: 0.5,
                                r: 0.8,
                                colorStops: [{
                                    offset: 0,
                                    color: 'rgba(147, 235, 248, 0)' // 0% 处的颜色
                                }, {
                                    offset: 1,
                                    color: 'rgba(147, 235, 248, .2)' // 100% 处的颜色
                                }],
                                globalCoord: false // 缺省为 false
                            },
                            shadowColor: 'rgba(128, 217, 248, 1)',
                            // shadowColor: 'rgba(255, 255, 255, 1)',
                            shadowOffsetX: -2,
                            shadowOffsetY: 2,
                            shadowBlur: 10
                        },
                        emphasis: {
                            areaColor: '#389BB7',
                            borderWidth: 0
                        }
                    }
                },
            },
            options: []
        };
        optionXyMap01.options.push({
            backgroundColor: '#051b4a',
            title: [{
                id: 'statistic',
                text: "疫情地图",
                left: '30%',
                top: '2%',
                textStyle: {
                    color: '#fff',
                    fontSize: 30
                }
            }],
            series: [
                //未知作用
                {
                    //文字和标志
                    name: 'light',
                    type: 'scatter',
                    coordinateSystem: 'geo',
                    data: convertData(mapData[0]),

                },
                //地图？
                {
                    type: 'map',
                    map: 'china',
                    geoIndex: 0,
                    aspectScale: 0.75, //长宽比
                    showLegendSymbol: false, // 存在legend时显示
                    label: {
                        normal: {
                            show: false
                        },
                        emphasis: {
                            show: false,
                            textStyle: {
                                color: '#fff'
                            }
                        }
                    },
                    animation: false,
                    data: convertData(mapData[0])
                },
                //地图点的动画效果
                {
                    //  name: 'Top 5',
                    type: 'effectScatter',
                    coordinateSystem: 'geo',
                    data: convertData(mapData[0]),
                    symbolSize: function (val) {
                        return val[2] / 10;
                    },
                    showEffectOn: 'render',
                    rippleEffect: {
                        brushType: 'stroke'
                    },
                    label: {
                        normal: {
                            formatter: '{b}',
                            position: 'right',
                            show: true
                        }
                    },
                    itemStyle: {
                        normal: {
                            color: "#F46E36",
                            shadowBlur: 10,
                            shadowColor: "#F46E36"
                        }
                    }
                }


            ]
        });
        const myChart = echarts.init(document.getElementById('mainMap'));
        myChart.setOption(optionXyMap01);
    }

    render() {
        return (
            <div className="chinaMap">
                <div id='load'><Spin tip="Loading...">
                    <Alert
                        message="Alert message title"
                        description="Further details about the context of this alert."
                        type="info"
                    />
                </Spin></div>
                <div>
                    <span></span>
                </div>
                <div id="mainMap" style={{width: '100vm', height: '100vh', dispaly: 'none'}}></div>
            </div>
        );
    }
}

export default App;
