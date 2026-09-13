# 动作库与事件设置（v9）

动作库加载 16 个 Blender 人物 GLB 的真实骨骼动画，按顾客、厨师、服务员岗位过滤。独立 3D 预览支持播放、暂停、进度、循环、速度、骨骼和视角重置；隐藏页面后停止预览帧。预览不会改变主场景，应用动作仍交由场景检查角色、现有座位和控制权。

本版追加排队、看菜单、喝水、呼叫服务员，以及清洗、搅拌、调味、检查餐品、迎宾、引导、倾听、擦桌。菜单、喝水与呼叫服务员使用已验证的坐姿和原场景餐椅；不会创建临时凳子。擦桌排期使用原餐桌 OBB 边外 0.37 米的有效站位，朝向桌边。动作应用本身不等于消费事件完成。

## 事件库只做设置

事件库没有选人触发按钮和事件历史页。这里编辑事件名称、描述、适用岗位、物体类别、距离阈值、持续时间和动作。物体类别使用独立复选框，可以同时勾选等候位置、入口、餐椅、餐桌、工作台与厨房设备；具体对象列表与对象选择控件已移除。每个勾选类别中的全部可用对象都参与运行时选择。

目前目标策略为“可达路径最近”。运行时先检查同层地板、障碍、人物占用和物体条件，再把所有勾选类别的候选对象合并，按 A* 实际路径总长统一排序；到达后朝向目标。距离阈值对桌面等实体按水平外表面计算，服务事件还约束服务员与顾客的距离。桌椅参考来自现有几何，物体属性字段可继续扩展。

合法定义使用 `objectKinds: []` 类别数组，通过结构校验保存到注入存储的 `mindspace.event-definitions.v3`，默认定义来自 `public/data/event-library.json`。场景级隔离由调用方提供的存储包装负责。只接受明确字段、已实现事件类型、合法角色动作、非空且不重复的类别、0.15–3 米阈值和 0.2–600 秒时长。服务距离至少 0.8 米。描述只作文本，不执行脚本。存储失败会明确报告未保存。

旧 v2 定义会把 `objectKind` 迁移为单元素 `objectKinds`，移除旧定义里的 `objectIds`，并显示迁移说明。新保存不保留隐藏的具体对象限制。初始人物排期的 `parameters.objectIds` 仍可内部固定某个等候点或岗位，该参数单独校验，类别不匹配时拒绝执行。

多选不会绕过事件条件：找座只接受餐椅，菜单、用餐、服务请求和擦桌只接受餐桌；勾选不适配类别会显示原因。等候可同时选择等候位置与入口，自由移动及普通站姿事件可跨类别寻找最近的可达目标。

## 人物执行入口在总览 L3

在总览选择人物，打开 L3“社会情境建模”，为该人物添加开始时刻、事件定义与可选时长覆盖，然后运行场景。时间从本次场景重置后的 0 秒开始；同一人物串行执行，前一项未完成时后续项等候。顾客可以进店、等候、找原有空椅、看菜单、点单、等待上菜、用餐、结账、离座和离店；工作人员可以安排岗位动作或移动到物体。移动中的端盘使用 Carry，抵达后停止。

事件执行显示实际状态、实际开始/结束时间、阻塞原因和失败原因。找座使用唯一占用预约；无空椅、无安全路径、距离不满足或尚未上菜均不会伪装成功。服务完成必须来自实际到位后的服务回执；专家控制的服务员仍由专家确认完成。餐品就绪时间是明确的规则厨房流程，不代表物理食物流或真实付款。

初始场景有三名顾客在不同入口等候点保持至少 20 秒可见，另有人正在找座、看菜单、等点单、少量用餐及错峰进店。入口占用时等待，不瞬移进入人群。拥堵时使用通过连续碰撞校验的短距离让行，并重新检查目标。

采集、回放锁定定义和计划修改，动作预览仍可浏览。手动操作取消该人物本轮剩余排期并记入日志；保存的计划保留，重置后从 0 秒再运行。绑定专家的人物优先于排期，浏览选中另一个人不会改变控制权。历史计划按录制快照只读显示，退出回放恢复当前计划，保持暂停中的个体任务上下文。

## 集成接口

```js
const libraries = new ActivityLibraries({
  actionContainer, eventContainer, profiles, layout,
  canEdit: () => !capturing && !replaying,
  onApplyAction: ({actorId, action}) => ({ok, reason}),
  onDefinitionsChange: () => schedule.refreshDefinitions(),
});
await libraries.init();
libraries.getEventDefinitions(); // 深拷贝，构造后即可读取
libraries.getInteractiveObjects();
libraries.show('actions'); // 'events' 或 null
libraries.tick(snapshot);

const schedule = new ActorEventSchedule({
  sim, director, layout, profiles,
  getEventDefinitions: () => libraries.getEventDefinitions(),
  canEdit: () => !capturing && !replaying,
  onEvent: actualEvent => recorder.append(actualEvent),
}).init();
schedule.mount(l3Container, actorId);
schedule.tick(sim.getSnapshot());
schedule.getSnapshot(); // 定义、持久计划和运行状态：采集元数据
schedule.getRuntimeSnapshot(); // 直接运行对象：每帧，无额外 runtime 外壳
schedule.setReplaySnapshot(recordedSnapshot);
schedule.setReplaySnapshot({runtime: recordedFrame.eventSchedule});
schedule.setReplaySnapshot(null); // 退出回放
schedule.interruptActor(actorId, {reason: 'manual-action'});
schedule.reset(); // 场景重置后调用
```

实际运行事件保留在总览活动日志和采集器中。`appendEvent()`/`exportHistory()` 仍供兼容调用方保留原始事件，事件库界面不再承担历史浏览；库最多保留 2,000 条，导出包含总接收数与丢弃数，完整历史应由采集器保存。

这是基于规则的运动学消费仿真。计划、动作预览和事件配置均不表示已经完成模型训练、生理预测、物理餐品交付或付款系统接入。
