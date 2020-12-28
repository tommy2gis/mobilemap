### 目录结构

```bash
├── public                  # 公共静态资源及编译文件
└── src                     # 应用源文件
   ├── index.jsx            # 程序启动和渲染入口
   ├── components           # 全局可复用组件
   ├── modules              # module(reducers/constants/actions)
   │   ├── SearchBar        # poi查询  
   │   ├── HotSearch        # 热门搜索 
   │   ├── Thematic         # 专题目录  
   │   └── Routing          # 路径查询
   ├── store                # Redux相关模块
   │   ├── createStore.js   # 创建和使用redux store  
   │   └── reducers.js      # Reducer的注册和注入
   ├── themes               # 主题样式表
   └── utils                # 通用工具类
``` 

# lmapclient
base map build by  leaflet react
npm start
webpack -b
