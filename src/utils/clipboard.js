import Clipboard from "clipboard";
import { Message } from 'element-ui';
let copy = (e, text) => {
  // console.log(e);
  // console.log(text, 'text');
  const clipboard = new Clipboard(e.target, { text: () => text });
  let resetClipboard = () => {
    // 释放内存
    clipboard.off("error");
    clipboard.off("success");
    clipboard.destroy();
  }
  // console.log(clipboard, 'clipboard');
  clipboard.on("success", (e) => {
    Message.success("复制成功");
    resetClipboard();
  });
  clipboard.on("error", (e) => {
    // 不支持复制
    Message.warning("该浏览器不支持自动复制");
    resetClipboard();
  });
  clipboard.onClick(e);
}
export default copy;