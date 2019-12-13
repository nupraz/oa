<template>
  <div>
    <!--<el-button type="primary" @click="downloadImg">download</el-button>-->
    <div id="mountNode" />
  </div>
</template>

<script>
  import router from '@/router'
  import G6 from '@antv/g6'
  import { asyncRoutes, constantRoutes } from '@/router'
  import http from '@/utils/http'

  export default {
    name: 'DashboardAdmin',
    data() {
      return {
        graph: {},
        items: [...constantRoutes, ...asyncRoutes].filter((router) => {
          return !router.hidden && router.meta
        }),
        //定义图例节点(各个节点的填充颜色都通过这里获取，style.fill)
        legend: {
          //一级路由
          rootNode: {
            x: 300,
            y: 40,
            shape: 'rect',
            size: [80, 40],
            label: '一级路由',
            labelCfg: {
              position: 'right'
            },
            style: {
              fill: '#ffffff',
              stroke: '#096dd9',
              radius: 10
            }
          },
          //二级路由
          childNode: {
            x: 500,
            y: 40,
            shape: 'rect',
            size: [80, 40],
            label: '二级路由',
            labelCfg: {
              position: 'right'
            },
            style: {
              fill: '#40a9ff',
              stroke: '#096dd9',
              radius: 10
            }
          },
          //三级路由
          childestNode: {
            x: 700,
            y: 40,
            shape: 'ellipse',
            size: [80, 40],
            label: '三级路由',
            labelCfg: {
              position: 'right'
            },
            style: {
              //fill: '#ffaa11',
              fill: '#00EE76',
              stroke: '#096dd9'
            }
          },
          //代办笔数
          agencyNode: {
            x: 900,
            y: 40,
            shape: 'circle',
            size: [40, 40],
            label: '代办笔数',
            labelCfg: {
              position: 'right'
            },
            style: {
              fill: '#ff5070',
              stroke: '#096dd9'
            }
          },
          //禁用路由
          // todo 暂时没添加，形状不确定
          disabledNode: {
            x: 1100,
            y: 40,
            shape: 'rect',
            size: [80, 40],
            label: '未授权路由',
            labelCfg: {
              position: 'right'
            },
            style: {
              fill: '#D9D9D9',
              stroke: '#096dd9',
              radius: 10
            }
          }
        },
        //代办节点
        agency: [
          {
            name: 'AuditSchedule',
            url: '/api/schedules/agency'
          }
        ]
      }
    },
    mounted() {
      const root = {
        level: 1
      }
      const data = {
        nodes: this.getRouter(this.items, 60, 140, root),
        edges: []
      }
      //声明Graph
      this.graph = new G6.Graph({
        container: 'mountNode',
        width: 3690,
        height: 1500,
        modes: { // 支持的 behavior
          default: ['click-select']
        },
        // 默认节点配置
        defaultNode: {
          shape: 'rect',
          size: [100, 50]
        },
        nodeStyle: {
          // 节点在默认状态下的样式
          default: {
            fill: this.legend.rootNode.style.fill,
            stroke: '#096dd9',
            radius: 10
          },
          // 当节点在 selected 状态下的样式
          selected: {
            lineWidth: 2,
            fillOpacity: 0.8
          }
        },
        // 默认边配置
        defaultEdge: {
          shape: 'cubic-horizontal',
          size: 1
        },
        edgeStyle: {
          // 默认边的样式
          default: {
            stroke: '#A3B1BF'
          }
        }
      })
      //添加数据源
      this.graph.data(data)
      //渲染视图
      this.graph.render()
      //添加图例节点
      this.graph.addItem('node',this.legend.rootNode)
      this.graph.addItem('node',this.legend.childNode)
      this.graph.addItem('node',this.legend.childestNode)
      this.graph.addItem('node',this.legend.agencyNode)
      /*this.legend.forEach((value) => {
        const node = value
      })*/
      //遍历添加节点
      this.addNodes(data.nodes, this.graph)
      //节点点击
      this.graph.on('node:click', ev => {
        if (ev.item._cfg.model.router) {
          router.push(ev.item._cfg.model.router)
        }
      })
    },
    methods: {
      //添加节点和边
      addNodes(data, graph) {
        data.forEach((node)=>{
          if (node.children) {
            const childrenNodes = node.children
            let otId = ''
            childrenNodes.forEach((child)=>{
              //添加代办笔数
              this.agency.forEach((agency)=>{
                if(agency.name == child.id) {
                  http.get(agency.url).then(response=>{
                    if(response.data > 0) {
                      const node = graph.findById(child.id)._cfg.model
                      //代办事项笔数
                      graph.addItem('node', {
                        x: node.x+50,
                        y: node.y-25,
                        label: response.data.toString(),
                        shape: 'circle',
                        size: [20,20],
                        style: {
                          fill: this.legend.agencyNode.style.fill
                        }
                      })
                    }
                  })
                }
              })

              let childStyle = null;
              let childLabelCfg = null;
              //授权节点添加点击样式
              if (child.grant) {
                if (child.router) {
                  childStyle = {
                    fill: this.legend.childNode.style.fill,
                    cursor: 'pointer'
                  }
                  childLabelCfg = {
                    style: {
                      cursor: 'pointer'
                    }
                  }
                } else {
                  childStyle = {
                    fill: this.legend.childNode.style.fill,
                  }
                  childLabelCfg = {}
                }
              } else {
                childStyle = {
                  fill: this.legend.disabledNode.style.fill,
                }
              }
              //二级节点
              graph.addItem('node', {
                id: child.id,
                x: child.x+180,
                y: child.y,
                label: child.label,
                router: child.router,
                shape: 'rect',
                size: [100,50],
                style: childStyle,
                labelCfg: childLabelCfg,
              })

              //图标
              /*graph.addItem('node', {
                x: child.x+140,
                y: child.y,
                shape: 'image',
                size: [20,20],
                img: 'https://gw.alipayobjects.com/os/s/prod/antv/assets/image/logo-with-text-73b8a.svg'
              })*/
              graph.addItem('edge', {
                source: otId,
                target: child.id,
                /*style: {
                  endArrow: true
                }*/
              })
              otId = child.id

              //三级节点
              if (child.children) {
                const length = child.children.length
                //一个三级子节点
                if (length == 1) {
                  //授权节点添加点击样式
                  if (child.children[0].grant) {
                    childStyle = {
                      fill: this.legend.childestNode.style.fill,
                      cursor: 'pointer'
                    }
                    childLabelCfg = {
                      style: {
                        cursor: 'pointer'
                      }
                    }
                  } else {
                    childStyle = {
                      fill: this.legend.disabledNode.style.fill,
                    }
                    childLabelCfg = {}
                  }
                  graph.addItem('node', {
                    id: child.children[0].id,
                    x: child.x+180,
                    y: child.y+80,
                    label: child.children[0].label,
                    router: child.children[0].router,
                    shape: 'ellipse',
                    size: [100,50],
                    style: childStyle,
                    labelCfg: childLabelCfg,
                    //定义锚点，数组中的每一项都是一个锚点
                    anchorPoints: [[0.5, 0]]
                  })
                  graph.addItem('edge', {
                    source: child.children[0].pId,
                    target: child.children[0].id,
                  })
                }else if (length == 2) {
                  //两个三级子节点
                  if (child.children[0].grant) {
                    childStyle = {
                      fill: this.legend.childestNode.style.fill,
                      cursor: 'pointer'
                    }
                    childLabelCfg = {
                      style: {
                        cursor: 'pointer'
                      }
                    }
                  } else {
                    childStyle = {
                      fill: this.legend.disabledNode.style.fill,
                    }
                    childLabelCfg = {}
                  }
                  graph.addItem('node', {
                    id: child.children[0].id,
                    x: child.x+100,
                    y: child.y+70,
                    label: child.children[0].label,
                    router: child.children[0].router,
                    shape: 'ellipse',
                    size: [100,50],
                    style: childStyle,
                    labelCfg: childLabelCfg,
                    anchorPoints: [[0.5, 0]]
                  })
                  graph.addItem('edge', {
                    source: child.children[0].pId,
                    target: child.children[0].id,
                  })

                  if (child.children[1].grant) {
                    childStyle = {
                      fill: this.legend.childestNode.style.fill,
                      cursor: 'pointer'
                    }
                    childLabelCfg = {
                      style: {
                        cursor: 'pointer'
                      }
                    }
                  } else {
                    childStyle = {
                      fill: this.legend.disabledNode.style.fill,
                    }
                    childLabelCfg = {}
                  }
                  graph.addItem('node', {
                    id: child.children[1].id,
                    x: child.x+260,
                    y: child.y+70,
                    label: child.children[1].label,
                    router: child.children[1].router,
                    shape: 'ellipse',
                    size: [100,50],
                    style: childStyle,
                    labelCfg: childLabelCfg,
                    anchorPoints: [[0.5, 0]]
                  })
                  graph.addItem('edge', {
                    source: child.children[1].pId,
                    target: child.children[1].id,
                  })
                }else if (length == 3){
                  //三个三级子节点
                  if (child.children[0].grant) {
                    childStyle = {
                      fill: this.legend.childestNode.style.fill,
                      cursor: 'pointer'
                    }
                    childLabelCfg = {
                      style: {
                        cursor: 'pointer'
                      }
                    }
                  } else {
                    childStyle = {
                      fill: this.legend.disabledNode.style.fill,
                    }
                    childLabelCfg = {}
                  }
                  graph.addItem('node', {
                    id: child.children[0].id,
                    x: child.x+80,
                    y: child.y+70,
                    label: child.children[0].label,
                    router: child.children[0].router,
                    shape: 'ellipse',
                    size: [100,50],
                    style: childStyle,
                    labelCfg: childLabelCfg,
                    anchorPoints: [[0.5, 0]]
                  })
                  graph.addItem('edge', {
                    source: child.children[0].pId,
                    target: child.children[0].id,
                  })

                  if (child.children[1].grant) {
                    childStyle = {
                      fill: this.legend.childestNode.style.fill,
                      cursor: 'pointer'
                    }
                    childLabelCfg = {
                      style: {
                        cursor: 'pointer'
                      }
                    }
                  } else {
                    childStyle = {
                      fill: this.legend.disabledNode.style.fill,
                    }
                    childLabelCfg = {}
                  }
                  graph.addItem('node', {
                    id: child.children[1].id,
                    x: child.x+180,
                    y: child.y+80,
                    label: child.children[1].label,
                    router: child.children[1].router,
                    shape: 'ellipse',
                    size: [100,50],
                    style: childStyle,
                    labelCfg: childLabelCfg,
                    anchorPoints: [[0.5, 0]]
                  })
                  graph.addItem('edge', {
                    source: child.children[1].pId,
                    target: child.children[1].id,
                  })

                  if (child.children[2].grant) {
                    childStyle = {
                      fill: this.legend.childestNode.style.fill,
                      cursor: 'pointer'
                    }
                    childLabelCfg = {
                      style: {
                        cursor: 'pointer'
                      }
                    }
                  } else {
                    childStyle = {
                      fill: this.legend.disabledNode.style.fill,
                    }
                    childLabelCfg = {}
                  }
                  graph.addItem('node', {
                    id: child.children[2].id,
                    x: child.x+280,
                    y: child.y+70,
                    label: child.children[2].label,
                    router: child.children[2].router,
                    shape: 'ellipse',
                    size: [100,50],
                    style: childStyle,
                    labelCfg: childLabelCfg,
                    anchorPoints: [[0.5, 0]]
                  })
                  graph.addItem('edge', {
                    source: child.children[2].pId,
                    target: child.children[2].id,
                  })
                }else if (length == 4){
                  //四个三级子节点
                  if (child.children[0].grant) {
                    childStyle = {
                      fill: this.legend.childestNode.style.fill,
                      cursor: 'pointer'
                    }
                    childLabelCfg = {
                      style: {
                        cursor: 'pointer'
                      }
                    }
                  } else {
                    childStyle = {
                      fill: this.legend.disabledNode.style.fill,
                    }
                    childLabelCfg = {}
                  }
                  graph.addItem('node', {
                    id: child.children[0].id,
                    x: child.x+80,
                    y: child.y+50,
                    label: child.children[0].label,
                    router: child.children[0].router,
                    shape: 'ellipse',
                    size: [100,50],
                    style: childStyle,
                    labelCfg: childLabelCfg,
                    anchorPoints: [[0.5, 0]]
                  })
                  graph.addItem('edge', {
                    source: child.children[0].pId,
                    target: child.children[0].id,
                  })

                  if (child.children[1].grant) {
                    childStyle = {
                      fill: this.legend.childestNode.style.fill,
                      cursor: 'pointer'
                    }
                    childLabelCfg = {
                      style: {
                        cursor: 'pointer'
                      }
                    }
                  } else {
                    childStyle = {
                      fill: this.legend.disabledNode.style.fill,
                    }
                    childLabelCfg = {}
                  }
                  graph.addItem('node', {
                    id: child.children[1].id,
                    x: child.x+125,
                    y: child.y+100,
                    label: child.children[1].label,
                    router: child.children[1].router,
                    shape: 'ellipse',
                    size: [100,50],
                    style: childStyle,
                    labelCfg: childLabelCfg,
                    anchorPoints: [[0.5, 0]]
                  })
                  graph.addItem('edge', {
                    source: child.children[1].pId,
                    target: child.children[1].id,
                  })

                  if (child.children[2].grant) {
                    childStyle = {
                      fill: this.legend.childestNode.style.fill,
                      cursor: 'pointer'
                    }
                    childLabelCfg = {
                      style: {
                        cursor: 'pointer'
                      }
                    }
                  } else {
                    childStyle = {
                      fill: this.legend.disabledNode.style.fill,
                    }
                    childLabelCfg = {}
                  }
                  graph.addItem('node', {
                    id: child.children[2].id,
                    x: child.x+235,
                    y: child.y+100,
                    label: child.children[2].label,
                    router: child.children[2].router,
                    shape: 'ellipse',
                    size: [100,50],
                    style: childStyle,
                    labelCfg: childLabelCfg,
                    anchorPoints: [[0.5, 0]]
                  })
                  graph.addItem('edge', {
                    source: child.children[2].pId,
                    target: child.children[2].id,
                  })

                  if (child.children[3].grant) {
                    childStyle = {
                      fill: this.legend.childestNode.style.fill,
                      cursor: 'pointer'
                    }
                    childLabelCfg = {
                      style: {
                        cursor: 'pointer'
                      }
                    }
                  } else {
                    childStyle = {
                      fill: this.legend.disabledNode.style.fill,
                    }
                    childLabelCfg = {}
                  }
                  graph.addItem('node', {
                    id: child.children[3].id,
                    x: child.x+280,
                    y: child.y+50,
                    label: child.children[3].label,
                    router: child.children[3].router,
                    shape: 'ellipse',
                    size: [100,50],
                    style: childStyle,
                    labelCfg: childLabelCfg,
                    anchorPoints: [[0.5, 0]]
                  })
                  graph.addItem('edge', {
                    source: child.children[3].pId,
                    target: child.children[3].id,
                  })
                }

                child.children.forEach(childest=>{
                  //添加代办笔数
                  this.agency.forEach((agency)=>{
                    if(agency.name == childest.id) {
                      http.get(agency.url).then(response=>{
                        if (response.data > 0) {
                          const node = graph.findById(childest.id)._cfg.model
                          //代办事项笔数
                          graph.addItem('node', {
                            x: node.x+40,
                            y: node.y-20,
                            label: response.data.toString(),
                            shape: 'circle',
                            size: [20,20],
                            style: {
                              fill: this.legend.agencyNode.style.fill
                            }
                          })
                        }
                      })
                    }
                  })
                })
              }
            })
          }
        })
      },
      downloadImg() {
        const routers = this.items
        const root = {
          level: 1
        }
        console.log(this.getRouter(routers, 60, 100, root))
        this.graph.downloadImage('OA')
      },
      //根据路由提取data,授权的节点grant属性为true
      getRouter(routers, x, y, root) {
        let otRouter = []
        routers.forEach((router, i)=> {
          let item = {}
          let pRouter = ''
          if (router.name) {
            item.id = router.name
          }
          //TODO 需要根据当前用户授权路由遍历设置，当前默认true
          item.grant = true
          if (root) {
            item.level = root.level
            if (root.level == 1) {
              //根节点
              item.x = x
              item.y = y+180*i
              pRouter = router.path
              item.pId = 'root'
            } else {
              item.x = x+300*i
              item.y = y
              pRouter = root.pRouter+'/'+router.path
              if (root.pId) {
                item.pId = root.pId
              }
            }
          }
          if (router.meta && !router.hidden) {
            if (router.children) {
              const childRoot = {
                //是否为根节点
                level: root.level+1,
                //根节点的路由
                pRouter: pRouter,
                pId: router.name ? router.name : ''
              }
              const otChild = this.getRouter(router.children, item.x, item.y, childRoot)
              item.children = otChild
            }else {
              if (root.pRouter) {
                item.router = root.pRouter+'/'+router.path
              }
            }
            item.label = this.showLabel(router)
            otRouter.push(item)
          }
        })
        return otRouter
      },
      //返回指定路由title
      showLabel(data) {
        return this.$filters.translate(data.meta)
      }
    }
  }
</script>

