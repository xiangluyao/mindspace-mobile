# 顾客团队

在总览选择「框选组队」，场景暂停以便明确选择顾客。拖动矩形选择当前画面中可见的头部或身体中心投影；遮挡判定沿用场景的 `pickNormalized()`，包括墙体和剖切显示。屏幕后方、离店人物与工作人员不会被框选。选择窗口还提供顾客名单，可明确添加被遮挡或当前离店的顾客。不会依据人物距离自动组队。

每次框选完成后恢复原来的相机输入状态。继续框选时，普通拖动替换草稿成员，Shift 拖动增选或移除命中成员；Esc、取消按钮、窗口失焦和离开总览都会结束框选。俯视辅助只调用现有 `scene.focus('top')`。透明框选层与渲染 canvas 是不同元素，原来的人物拾取、地面双击目标和 OrbitControls 不会收到框选事件。场景保持暂停，用户可自行恢复运行。

团队至少包含两个顾客。组名、关系（朋友、家人、同事、自定义）和场合（普通用餐、聚餐、庆祝、商务、自定义）均由用户设置。已属于其他团队的人物不能被隐式转移；先编辑或解散原团队。支持编辑成员、解散、当前浏览器持久化和 JSON 导出。存储写入失败会拒绝修改，不会虚报保存。采集与回放时，UI 和数据层都拒绝修改，浏览与导出可用。

团队是显式的社会关系数据。每个成员仍使用原来的个体 ID、人格、控制权、导航、动作、占座和碰撞，不会被合并、瞬移或强制走同一条路线。画面中的细线和标签只跟随实际位置显示关系，不代表导航路线。现有自主行为必须通过上下文接口明确接入团队；本模块不声称已经实现集体订桌、团队到店或共享订单。

## 集成

```js
import {GroupWorkspace} from './group-workspace.js';
import './group-workspace.css';
const groups = new GroupWorkspace({
  sim, scene, profiles, viewport: document.querySelector('#viewport'),
  canEdit: () => !expert.active && !expert.replaying && !expert.busy,
  onPause: pause,
  invalidate,
  onChange: snapshot => { /* 关系配置更新 */ },
  onEvent: event => { /* 记录实际 group_created / updated / dissolved */ },
}).init();
groups.setActive(section === 'overview');
groups.tick(simulationSnapshot);
const relation = groups.getGroupFor(actorId); // 独立副本或 null
const metadata = groups.getSnapshot();
```

`container` 可选，用来挂载编辑面板；默认挂在 viewport 内。`init()` 同步返回实例。`setActive(false)` 隐藏工具和标签并释放输入。`beginSelection()` / `cancelSelection()` 可程序调用；`editGroup(id)`、`toggleMember(actorId)`、`saveGroup()`、`dissolveGroup()` 使用同一验证路径。`exportData()` 返回 JSON 数据；`dispose()` 移除 DOM 与监听器。

`getSnapshot()` 包含 `version/revision/groups/independentAgents`、持久化结果、草稿成员 ID 与选择模式状态，不含场景对象。每组包含 `id/name/memberIds/relationship/relationshipDetail/occasion/occasionDetail/createdAt/updatedAt`。`onChange` 收到完整轻量快照；`onEvent` 只在成功保存后收到实际修改及 `simTime`。采集器可把快照存入元数据，并在回放中使用录制的关系展示，不应把当前浏览器的关系当成历史关系。

回放接入调用 `setReplayGroups(recordedGroupSnapshot)`，只验证并展示采集中的关系，`getSnapshot()` 的 `source` 为 `replay`，`getGroupFor()` 与导出使用同一份历史关系。该模式会再次从数据层锁住修改，不写入 localStorage；无效或缺失历史团队显示为空并给出原因，不借用当前关系。退出回放调用 `setReplayGroups(null)`，恢复当前团队和回放前尚未保存的草稿。当前模式下重复传入 null 不会打断框选。

存储键为 `mindspace.customer-groups.v1`。载入时验证版本、顾客身份、重复成员和时间字段；无效保存数据不会部分生效，也不会自动覆盖原内容。JSON 导出不包含模型、人体关键点或 EEG 数据。
