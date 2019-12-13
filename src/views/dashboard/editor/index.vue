<template>
  <div>
    <el-button type="primary" @click="downloadImg">download</el-button>
    <el-button type="primary" @click="changeNode">change</el-button>
    <el-button type="primary" @click="addNode">add</el-button>
    <el-button type="primary" @click="updateNode">update</el-button>
    <el-button type="primary" @click="removeNode">remove</el-button>
    <el-button type="primary" @click="resetNode">reset</el-button>
    <el-button type="primary" @click="save">save</el-button>
    <el-input v-model="nodeLabel" style="width: 15%;" placeholder="请输入内容" />
    <div id="mountNode" />
  </div>
</template>

<script>
  import router from '@/router'
  import G6 from '@antv/g6'

  export default {
    name: 'DashboardEditor',
    data() {
      return {
        graph: {},
        nodeLabel: '测试节点',
        data: null
      }
    },
    watch: {
      //更新测试节点的label
      nodeLabel(val) {
        this.graph.update('demo', {
          label: val
        })
      }
    },
    mounted() {
      const data = {
        nodes: [
          {
            label: '用户相关',
            x: 60,
            y: 60
          },
          {
            id: 'userCenter',
            label: '用户中心',
            x: 200,
            y: 60
          },
          {
            label: '系统管理',
            x: 60,
            y: 150,
            //节点形状
            shape: 'rect'
          },
          {
            id: 'users',
            label: '用户管理',
            //跳转router
            router: '/authority/users',
            x: 200,
            y: 150,
            //节点样式
            style: {
              cursor: 'not-allowed'
            },
            labelCfg: {
              //label样式
              style: {
                cursor: 'not-allowed'
              }
            }
          },
          {
            id: 'roles',
            label: '角色维护',
            router: '/authority/roles',
            x: 350,
            y: 150,
            style: {
              cursor: 'pointer'
            },
            labelCfg: {
              //label样式
              style: {
                cursor: 'pointer'
              }
            }
          },
          {
            id: 'dicts',
            label: '字典管理',
            router: '/authority/dicts',
            x: 500,
            y: 150,
            style: {
              cursor: 'pointer'
            },
            labelCfg: {
              //label样式
              style: {
                cursor: 'pointer'
              }
            }
          },
          {
            id: 'demo',
            label: this.nodeLabel,
            x: 800,
            y: 150,
            //节点形状 rect/circle/ellipse/image
            shape: 'ellipse',
            //节点样式
            style: {
              //填充颜色
              fill: 'Wheat',
              //弧度
              radius: 10
            }
          },
          {
            label: '员工管理',
            x: 60,
            y: 240
          },
          {
            id: 'EmployeeDaily',
            label: '员工日报',
            shape: 'diamond',
            x: 340,
            y: 240,
            color: '#096dd9',
            style: {
              fill: '#ffff00'
            }
          },
          {
            id: 'imageNode',
            label: '图片节点',
            x: 500,
            y: 240,
            size: [50,50],
            shape: 'image',
            img: 'https://gss0.bdstatic.com/94o3dSag_xI4khGkpoWK1HF6hhy/baike/c0%3Dbaike180%2C5%2C5%2C180%2C60/sign=be386b2099529822113e3191b6a310ae/c75c10385343fbf24a0af1c4b97eca8065388f37.jpg',
            labelCfg: {
              //position: 'right'
            }
          }
        ],
        edges: [
          {
            source: 'users',
            target: 'roles',
            style: {
              //带箭头
              endArrow: true
            }
          },
          {
            source: 'roles',
            target: 'dicts'
          },
          {
            //开始端点
            source: 'dicts',
            //结束端点
            target: 'demo',
            //连线文本内容
            label: '试试连接线内容\n换行了',
            //使用自定义边
            shape: 'line-dash',
            curveLevel: 4,
            labelCfg: {
              refY: -20,
              refX: 0,
              autoRotate: true,
              style: {
                fill: 'red'
              }
            },
            style: {
              //带箭头
              endArrow: true,
              //边的颜色
              stroke: 'blue',
              lineDash: [2, 2]
            }
          },
          {
            source: 'demo',
            target: 'demo',
            shape: 'loop',
            loopCfg: {
              position: 'right',
              clockwise: true
            },
            style: {
              endArrow: true,
              stroke: 'red'
            }
          }
        ]
      }
      //自定义菱形
      G6.registerNode('diamond', {
        draw(cfg, group) {
          const size = cfg.size || [40, 40]; // 如果没有 size 时的默认大小
          const width = size[0];
          const height = size[1];
          const shape = group.addShape('path', {
            attrs: {
              //  / 1 \
              // 4     2
              //  \ 3 /
              path: [
                ['M', 0, height / 2], // 上部顶点
                ['L', width / 2, 0], // 右侧点
                ['L', 0, - height / 2], // 下部
                ['L', - width / 2, 0], // 左侧
                ['Z'] // 封闭
              ],
              stroke: cfg.color, // 颜色应用到边上，如果应用到填充，则使用 fill: cfg.color
              fill: cfg.style.fill
            }
          });
          if(cfg.label) { // 如果有文本
            // 如果需要复杂的文本配置项，可以通过 labeCfg 传入
            // const style = (cfg.labelCfg && cfg.labelCfg.style) || {};
            // style.text = cfg.label;
            group.addShape('text', {
              // attrs: style
              attrs: {
                x: 0, // 居中
                y: 0,
                textAlign: 'center',
                textBaseline: 'middle',
                text: cfg.label,
                fill: '#666'
              }
            });
          }
          return shape;
        }
      });

      //自定义边
      G6.registerEdge('hvh', {
        draw(cfg, group) {
          const startPoint = cfg.startPoint;
          const endPoint = cfg.endPoint;
          const shape = group.addShape('path', {
            attrs: {
              stroke: '#333',
              path: [
                ['M', startPoint.x, startPoint.y],
                ['L', endPoint.x / 3 + 2 / 3 * startPoint.x , startPoint.y],
                ['L', endPoint.x / 3 + 2 / 3 * startPoint.x , endPoint.y],
                ['L', endPoint.x, endPoint.y]
              ]
            }
          });
          return shape;
        }
      });

      //自定义behavior
      // 封装点击添加边的交互
      G6.registerBehavior('click-add-edge', {
        getEvents() {
          return {
            'node:click': 'onClick' ,
            mousemove: 'onMousemove'
          };
        },
        onClick(ev) {
          const node = ev.item;
          const graph = this.graph;
          const point = {x: ev.x, y: ev.y};
          const model = node.getModel();
          // 如果在添加边的过程中，再次点击另一个节点，结束边的添加
          if (this.addingEdge && this.edge) {
            graph.updateItem(this.edge, {
              target: model.id
            });
            this.edge = null;
            this.addingEdge = false;
          } else {
            // 点击节点，触发增加边
            this.edge = graph.addItem('edge', {
              source: model.id,
              target: point
            });
            this.addingEdge = true;
          }
        },
        onMousemove(ev) {
          const point = {x: ev.x, y: ev.y};
          if (this.addingEdge && this.edge) {
            // 增加边的过程中，移动时边跟着移动
            this.graph.updateItem(this.edge, {
              target: point
            });
          }
        }
      });

      //电线运动
      // lineDash 的差值，可以在后面提供 util 方法自动计算
      const dashArray = [
        [0,1],
        [0,2],
        [1,2],
        [0,1,1,2],
        [0,2,1,2],
        [1,2,1,2],
        [2,2,1,2],
        [3,2,1,2],
        [4,2,1,2]
      ];

      const lineDash = [4, 2, 1, 2];
      const interval = 9; // lineDash 的和
      G6.registerEdge('line-dash', {
        afterDraw(cfg, group) {
          const shape = group.get('children')[0];
          const length = 200; //先写死，后续 G 增加 totalLength 的接口
          let totalArray = [];
          // 计算出整条线的 lineDash
          for (var i = 0; i < length; i += interval) {
            totalArray = totalArray.concat(lineDash);
          }
          let index = 0;
          shape.animate({
            onFrame() {
              const cfg = {
                lineDash: dashArray[index].concat(totalArray)
              };
              index = (index + 1) % interval;
              return cfg;
            },
            repeat: true
          }, 3000);
        }
      }, 'cubic');

      //声明Graph
      this.graph = new G6.Graph({
        container: 'mountNode',
        width: 1800,
        height: 1500,
        modes: { // 支持的 behavior
          default: [
            {
              //点击选中节点
              type: 'click-select',
              //是否允许多选(默认按住Ctrl键多选)
              multiple: false,
              //指定按住哪个键进行多选，默认是17，按住Ctrl键多选
              keyCode: 17
            },
            {
              type: 'click-add-edge'
            },
            /*{
              //拖拽节点
              type: 'drag-node',
              //是否在拖拽节点时更新所有与之相连的边。默认为true。
              updateEdge: true
            },
            {
              //拖拽画布
              type: 'drag-canvas',
              //允许拖拽方向。支持x， y, both。默认方向为both
              direction: 'y'
            },
            {
              //滚轮缩放画布
              type: 'zoom-canvas',
              //缩放灵敏度，支持1-10的数值。默认灵敏度为5
              sensitivity: 4
            },
            {
              //节点tooltip
              type: 'tooltip',
              //格式化文本
              formatText(model) {
                return model.label;
              }
            },
            {
              //连线tooltip
              type: 'edge-tooltip',
              formatText(model) {
                return model.source+"->"+model.target
              }
            },
            {
              //当鼠标移到某节点时，突出显示该节点以及与其直接关联的节点和连线
              type: 'activate-relations',
              trigger: 'mouseenter'
            }*/
          ]
        },
        // 默认节点配置
        defaultNode: {
          shape: 'rect',
          size: [100, 50]
        },
        nodeStyle: {
          // 节点在默认状态下的样式
          default: {
            fill: '#40a9ff',
            stroke: '#096dd9'
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
      /*const node1 = graph.findById('users')
      console.log(node1)
      if (node1.isVisible()){
        graph.hideItem(node1)
      }*/
      this.graph.on('node:click', ev => {
        if (ev.item._cfg.model.router) {
          router.push(ev.item._cfg.model.router)
        }
        // TODO: 试一下能不能自定义属性，直接把route定义到node上
        /*if (ev.item._cfg.id) {
          if (ev.item._cfg.id === 'users') {
            router.push('/authority/users')
          }
        }*/
      })

      this.data = this.graph.save()
    },
    methods: {
      save() {
        const data = this.graph.save()
        console.log(data)
      },
      downloadImg() {
        this.graph.downloadImage('OA')
      },
      addNode() {
        //添加元素 add/addItem
        this.graph.add('node', {
          shape: 'rect',
          size: [100,40],
          x: 340,
          y: 60,
          label: '新添加的节点'
        })
      },
      updateNode() {
        //跟新某个元素
        this.graph.update('roles', {
          shape: 'ellipse',
          style: {
            fill: 'yellow'
          }
        })
      },
      removeNode() {
        const item = this.graph.findById('demo')
        //删除元素  remove/removeItem
        this.graph.remove(item)
      },
      changeNode() {
        //隐藏某个元素
        //this.graph.hideItem('roles')
        //this.graph.showItem('roles')

        // 找到id对应元素，设置节点形状
        this.graph.findById('users').get('model').shape = 'circle';
        this.graph.refreshItem('users');
        //重计算后刷新当前画布
        //this.graph.refresh()
        //不做任何更新和重计算，仅重绘画布
        //this.graph.paint()
        //this.graph.clear()
      },
      resetNode() {
        this.graph.data(this.data)
        this.graph.render()
      }
    }
  }
</script>
<style>
  .g6-tooltip {
    padding: 10px 6px;
    color: #ffffff;
    background-color: #303133;
    border: 1px solid #303133;
    border-radius: 4px;
  }
</style>

