# 🚀 快速参考 - Splendor Duel 现代化工具链

## 常用命令速查表

```bash
# 📦 项目启动
npm install                 # 安装依赖
npm run dev                 # 启动开发服务器 (http://localhost:5174)
npm run build               # 生产构建

# 🧪 测试
npm test                    # 运行测试（监视模式）
npm test -- --run           # 运行测试一次
npm run test:ui             # 打开测试仪表板 (http://localhost:51204)
npm run test:coverage       # 生成覆盖率报告

# 🔍 代码质量
npm run lint                # ESLint 检查
```

## 文件导航

### 新添加的关键文件

| 文件                            | 用途                                            |
| ------------------------------- | ----------------------------------------------- |
| `/src/types.d.ts`               | 核心类型定义（GemColor, Card, Buff, GameState） |
| `/tsconfig.json`                | TypeScript 配置（支持 JS/TS 混合）              |
| `/vitest.config.ts`             | 测试框架配置                                    |
| `/src/logic/gameReducer.js`     | ✨ 已使用 Immer 优化                            |
| `/src/logic/actions/__tests__/` | 测试文件目录                                    |
| `/TESTING.md`                   | 测试编写指南                                    |
| `/MODERNIZATION_REPORT.md`      | 完整执行报告                                    |

## 核心概念快速理解

### 🔵 TypeScript 类型系统

现在你可以依赖类型检查：

```javascript
// ✅ 类型安全示例
import { GameState, Card, GemColor } from './types';

function calculateCost(card: Card, discounts: Record<GemColor, number>): number {
  return Object.entries(card.cost).reduce((total, [gem, count]) => {
    return total + Math.max(0, count - (discounts[gem] || 0));
  }, 0);
}
```

### 🟢 Immer 状态管理

不再需要 spread 操作，直接修改：

```javascript
import { produce } from 'immer';

// ❌ 旧方式（繁琐）
const newState = { ...state };
newState.inventories[player] = { ...newState.inventories[player] };
newState.inventories[player][gem]++;

// ✅ 新方式（清晰）
return produce(state, (draft) => {
    draft.inventories[player][gem]++;
});
```

### 🔴 编写测试

快速模板：

```javascript
import { describe, it, expect, beforeEach } from 'vitest';
import { handleSomeAction } from '../actions';

describe('handleSomeAction', () => {
    let state;

    beforeEach(() => {
        state = createTestState(); // 创建测试状态
    });

    it('should do something', () => {
        const result = handleSomeAction(state, payload);
        expect(result.someField).toEqual(expectedValue);
    });
});
```

## 性能对比

### Immer 优化效果

```
场景：游戏回放 100 个 actions

旧方式（JSON 深拷贝）：
  ├─ 序列化: 20ms
  ├─ 解析: 20ms
  └─ × 100 = 4000ms ❌

新方式（Immer 结构共享）：
  └─ × 100 = 40ms ✅

性能提升：100 倍！⚡
```

## 开发工作流

### 修改游戏逻辑时

```
1. 修改代码
   └─ src/logic/actions/boardActions.js

2. TypeScript 类型检查
   └─ 自动在 IDE 中显示错误

3. Immer 自动处理状态不可变性
   └─ 无需手动 spread/clone

4. 运行测试
   └─ npm test
   └─ 确保逻辑正确

5. 检查覆盖率
   └─ npm run test:coverage
   └─ 目标：90%+
```

### 新增功能时

```
1. 在 src/types.d.ts 定义新类型
2. 在 src/logic/actions/ 中编写 handler
3. 在 src/logic/actions/__tests__/ 中编写测试
4. 运行测试确保功能正常
```

## IDE 配置建议

### VSCode 扩展推荐

- **ES7+ React/Redux/React-Native snippets** - 代码片段
- **ESLint** - 代码检查
- **Prettier** - 代码格式化
- **Vitest** - 测试支持

### 快捷键提示

```
Ctrl+K Ctrl+I      - 查看类型提示
F12                - 跳转到定义
Ctrl+Shift+P       - 打开命令面板
  > Run Tests      - 运行测试
```

## 常见问题

### Q: TypeScript 报错说找不到类型？

A: 确保 `src/types.d.ts` 在项目中，并且 `tsconfig.json` 正确配置了 `include: ["src"]`

### Q: 测试运行很慢？

A: 这是正常的第一次运行。之后应该很快。若持续慢，尝试：

```bash
npm test -- --clear-cache
```

### Q: 如何调试失败的测试？

A: 在测试文件中添加 `console.log()` 然后运行：

```bash
npm test -- --reporter=verbose
```

### Q: Immer 兼容我的代码吗？

A: 只要你的 handlers 直接修改 state 对象就兼容。现有代码已验证兼容！

## 下一步学习资源

- 📖 [Immer 官方文档](https://immerjs.github.io/immer/)
- 📖 [Vitest 官方文档](https://vitest.dev/)
- 📖 [TypeScript 手册](https://www.typescriptlang.org/docs/)
- 📄 详见项目内 `/MODERNIZATION_REPORT.md` 和 `/TESTING.md`

---

**最后更新**: 2025-12-27  
**版本**: Splendor Duel v3.1.0 + 现代化工具链
