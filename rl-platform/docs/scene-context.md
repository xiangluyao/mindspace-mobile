# 场景上下文 v9

场景选择位于五个页面原有标题中。主平台Human Layer菜单负责换页，不再有重复的整行导航。直接打开人物页时提供同位置的页面选择。

`sceneId`是human-layer.html场景参数；父平台使用`humanScene`并跨导航保留。当前默认`restaurant`；错误编号显示加载错误，不静默混入餐厅。新建独立配置共享当前资产，但从独立存储空间初始化。

```js
window.mindspaceHumanLayer.getSceneContext();
window.mindspaceHumanLayer.registerScene({
  id: 'restaurant-study-2', name: '餐厅实验二', modelLabel: '开放餐厅 v2',
  assets: {
    characters: './assets/characters.json', keypoints: './assets/keypoints.json',
    layout: './assets/restaurant-layout.json', environment: './assets/restaurant-scene.glb',
    modelsBase: './assets/'
  }
});
```

注册后场景选择即时更新。模型资源必须为当前站点内路径；最多50个场景。当前API注册资源，不提供模型上传、生成建筑或新场景语义适配。

`createSceneStorage(id)`包装localStorage，将所有写入分域至`mindspace.scene.<id>::<key>`。仅restaurant在分域键不存在时兼容旧未分域数据；不修改原键。删除写墓碑，避免旧值再次回流。新配置不读取restaurant旧键。人格、事件、计划、团队、视野与姿态编辑均使用这一包装器。

采集元数据含`sceneContext`与`libraries.sceneContext`，姿态数据位于`libraries.poseOverrides`；`getState().workspace.poseOverrides`返回实际在用的修订（回放时为历史临时值）。`getKeypoints()`读取应用修订后的世界坐标。采集记录按场景列出；缺少sceneContext的旧餐厅记录只归入restaurant。采集、回放、结束保存时锁定场景切换和注册。

静态资产目录`public/data/human-scenes.json`可加入未来场景。新建筑仍需提供可行走地板、墙/家具导航、座位锚点、角色、事件目标等数据，并完成场景语义集成及验证。
