import { Button } from "@arco-design/web-react";
import { useState } from "react";

// 用于编写业务组件
// 示例代码
export default function Example() {
  const [count, setCount] = useState(0);

  return (
    <div>
      {count}
      {/* 可以查找 Arco Design 组件库官方文档 */}
      <Button
        onClick={() => {
          setCount((count) => count + 1);
        }}
      >
        click me!
      </Button>
    </div>
  );
}
