# 人物属性 · v9

页面以人物为主层级，先选当前场景中的人，再分别编辑同级的“基础属性”“大五人格”“行为标签 / 偏好”。不需要先创建或选择人格模板。场景中的顾客、厨师和服务员均可直接配置；三个区域分别保存。

## 三个平行区域

| 区域 | 可编辑内容 | 保存边界 |
| --- | --- | --- |
| 基础属性 | 年龄、性别、身高、可选体重 | 不覆盖大五或行为标签/偏好 |
| 大五人格 | 启用状态、OCEAN逐维0–100配置、逐维留空 | 不修改基础资料、标签或消费关注 |
| 行为标签 / 偏好 | 标签、行为描述、消费关注、表达方式 | 不自动生成或覆盖大五和基础资料 |

左侧选择全部16人中的任一人物，或按岗位、文字搜索。人物卡片显示个人设置和未保存状态。编辑后点击当前区域的“保存”；切换区域或人物时，本页的未保存草稿保留，但刷新不会保留这些草稿。其他区域的未保存草稿不会被一次保存悄悄写入。

原来没有绑定档案的角色，首次保存会自动建立个人配置。对于旧版共享档案或只读预设，编辑时自动为当前人物建立独立副本，保留未编辑区域，其他人物及原档案不变。以后此人的三个区域更新同一独立记录。

基础资料默认未知，大五默认未启用、五维留空。行为区域保留现有标签、消费关注和表达方式；尚无个人配置时，滑块显示通用0.50默认值，只有保存此区域或创建个人配置后才写入，不作为测量结果。

身高只提供资料参数，不改变三维模型尺寸或骨骼。可明确点击“使用当前模型的身高”填写已知资产尺寸；不根据外观推断年龄、性别或人格。岗位身份与同行关系仍由场景管理。

## 辅助模板、备份与编辑锁

模板工具放在每个区域末尾的折叠辅助区，默认关闭。选择旧预设或自建档案后，“套用至当前区域”只填入这个区域的草稿，点击保存才生效，其他区域保持原值。也可把当前已经保存的三类属性另存为模板副本；未绑定的自建模板可删除，正在被人物使用的记录不可从此工具删除。

右上“备份与说明”提供JSON导出/导入。导出只包含已保存状态；导入替换当前库，建议先备份。旧v1/v2 JSON继续支持，不提供点评或语言分析导入。

采集、回放期间可浏览和导出，三个区域、模板修改和JSON导入全部锁定。文件读取期间若开始采集或切换场景，导入取消，不能把原场景文件写进新的场景。

## 基础字段与可选大五

基础资料存于 `profile.basics`：

| 字段 | 格式 | 说明 |
| --- | --- | --- |
| age | integer 0–120 或 null | 岁；null为未知，0不被当作空值 |
| gender | unspecified / female / male / custom | 默认 unspecified |
| genderLabel | string | custom时必填，其余留空 |
| heightCm | number 50–250 或 null | cm；只提供资料参数 |
| weightKg | number 2–350 或 null | kg；可选 |

大五存于 `profile.bigFive`：

```json
{
  "enabled": false,
  "values": {
    "openness": null,
    "conscientiousness": null,
    "extraversion": null,
    "agreeableness": null,
    "neuroticism": null
  },
  "source": {"type": "unset", "label": "", "version": ""}
}
```

五维分别是开放性、尽责性、外向性、宜人性、情绪敏感性。数值范围0–100；低、中、高按钮设置25、50、75，并可用滑块或数字框调整。每一维都可以独立留空。启用大五至少需要一项值；关闭时可保留已有值，算法必须按 `enabled` 判断是否使用，不能把 `null` 当作0或50。

UI修改大五值后，来源标记为 `user_configuration`。后续外部数据可通过档案JSON传入 `source.type="external"`，并填写 `label` 与 `version`。这只是明确来源的接口，不代表平台验证了问卷、样本、校准或人格测量。所有档案保留 `calibration.status="not_calibrated"`。消费关注 `focus` 和表达方式 `expression` 仍是0–1仿真参数，与大五0–100尺度不同。

## 持久化与旧版迁移

新版schema为 `mindspace-persona-library/v2`，存储键为 `mindspace.persona-library.v2`。浏览器存储按源隔离，5205与5206端口属于不同库；跨设备或跨端口请导出、导入JSON。

首次打开若没有v2键但存在 `mindspace.persona-library.v1`，程序将旧档案和绑定迁移到新键：

- 保留自建档案ID、名称、描述、标签、消费关注、表达方式及绑定。
- 旧版大五0–1值保留于 `profile.legacyV7.bigFive`，新版不自动启用。在大五人格区域可以明确选择“恢复旧版仿真设置（×100）”，作为用户配置继续使用。
- 新基础资料默认未知。原v1键完整保留，其中包含旧版用户导入的资料，不被删除或重写。新版不重复存放旧研究数据，避免占满浏览器配额。
- 导入旧版v1 JSON时，先把完整原文保存在独立的 `mindspace.persona-library.v1.import.<时间>` 备份键，然后迁移档案；原文件也应保留。没有浏览器存储时只有当前页状态，原导入文件是完整备份。
- 数据损坏或版本不兼容时，显示预设并阻止覆盖原存储。迁移写入失败时，已恢复的档案留在当前页面，原v1键完整保留，可导出或释放空间后重试保存。
- 每次变更先校验并写入本地存储，成功后才更新内存状态。配额不足时修改不生效，不会悄悄丢失旧绑定。

单个导入JSON最多3 MiB，新版有效档案库最多1 MiB、100份档案；不允许不安全对象键、越界或非有限数值、重复档案ID和悬空绑定。清除浏览器数据会移除对应存储键，请先导出备份。

## 场景与接入接口

```js
import { PersonaLibrary } from './persona-library.js'; // 自动import自身CSS
const library = new PersonaLibrary({
  container,
  profiles: () => currentScenePeople,
  storage: scopedStorage,        // 可选；提供getItem/setItem的场景包装器
  getSceneContext: () => ({
    id: currentConfigurationId,
    sceneId: 'restaurant',
    name: currentConfigurationName,
    kind: 'demo'
  }),
  onAssign: change => {},        // actorId, personaId, previousPersonaId, profile
  onChange: snapshot => {},
  canEdit: () => !recording && !replaying
});
await library.init();
library.selectActor('p11');
library.getAssignments();
library.getProfileFor('p11');   // 含三类已保存字段的深拷贝，或null
library.getSnapshot();          // v2 schema、personas、assignments、可选sceneContext
library.refresh();              // 刷新编辑锁；context.id改变时重新读取当前scope
```

固定头部选择器为 `.persona-library .pl-header`，由主平台在这里挂统一场景选择器，本模块不创建第二条场景导航。`storage`未提供时继续使用当前源localStorage并沿用v8行为；显式传入null时只保留内存。传入包装器后，所有当前保存、旧版迁移和导入备份只使用该包装器的getItem/setItem，不自行跨场景访问原生存储。

`getSceneContext()`默认返回null；其 `id` 应唯一标识配置空间。`refresh()`发现id变化时，重新加载该scope的人物属性、清除旧页面草稿，并显示新的场景名称。原场景保留于其独立存储空间，切回后可读取。当前展示资产仍是餐厅；从展示场景创建的演练副本共享同一模型，只隔离库设置，不构成新建三维环境。`profiles`为空时显示空场景提示，不生成角色。

数据层新增 `PersonaStore.getActorDomain(actorId, domain)` 与 `updateActorDomain(actorId, domain, value, {name})`。domain为basics、bigFive或behavior；behavior映射到tags、description、focus、expression。写入拒绝夹带其他区域字段；首次保存、共享记录分离和域更新在同一次校验及存储提交中完成，写入失败不改变任何绑定。

底层保持 `mindspace-persona-library/v2` 格式，避免不必要的数据再迁移；本轮内容版本为9.0.0。既有API可继续访问整个绑定档案，页面则以人物和三个平行区域呈现。`onAssign`只通知场景，不改动人群仿真；配置更新时也为受影响人物发出通知。`sceneContext`属于快照/导出来源信息，导入后仍以当前所选scope为目标，不由文件改变平台场景。

人格页面不加载 `review-liwc-analysis.json`，也不返回 `precomputedAnalysis`；历史研究脚本和v7专项说明作为独立源码备份保留。

## 验证

`node --test tests/persona-store.test.mjs`：19项通过，包括旧v7/v8兼容、独立域保存、共享档案自动分离、模板保护、跨域参数拒绝、配额回滚与场景存储包装器隔离。真实Chrome模块验收14项通过，覆盖人物优先、三域隔离、模板辅助套用、草稿、锁定与跨场景持久化；记录位于开发工作区 `work/persona-v9-qa/`；另有完整Human Layer开发入口4项检查通过：三维场景成功初始化，服务员三域保存均通过真实workspace接口读取，页面异常与console错误为0。最终dist与统一场景选择器仍由本轮生产验收核对。
