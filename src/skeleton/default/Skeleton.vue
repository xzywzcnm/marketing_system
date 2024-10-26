<script>
export default {
  // name: "skeleton",
  functional: true,
  render(createElement, context) {
    return (
      <div class="skeleton-block">
        <div class="loader13 loader">
          <div class="loader-13">
            <div></div>
            <div></div>
            <div></div>
            <div></div>
            <div></div>
          </div>
        </div>
      </div>
    );
  }
};
</script>

<style scoped>
.skeleton-block {
  display: flex;
  flex-direction: column;
  padding: 16px;
  justify-content: center;
  align-items: center;
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
}
.loader {
  width: 200px;
  height: 200px;
  display: flex;
  justify-content: center;
  align-items: center;
}
@keyframes loader13-1 {
  0% {
    transform: rotate(270deg);
  }
  50% {
    transform: rotate(360deg);
  }
  100% {
    transform: rotate(270deg);
  }
}
@keyframes loader13-2 {
  0% {
    transform: rotate(90deg);
  }
  50% {
    transform: rotate(0deg);
  }
  100% {
    transform: rotate(90deg);
  }
}
@keyframes loader13-3 {
  0% {
    left: 100px;
  }
  100% {
    left: 20px;
  }
}
.loader-13 {
  position: relative;
  width: 100px;
  height: 100px;
}
.loader-13 div:nth-child(1),
.loader-13 div:nth-child(2) {
  width: 0px;
  height: 0px;
  border: 25px solid #2E8CF0;
  border-right: 25px solid transparent;
  border-radius: 50%;
  position: absolute;
}
.loader-13 div:nth-child(1) {
  animation: loader13-1 0.5s 0s infinite linear;
}
.loader-13 div:nth-child(2) {
  animation: loader13-2 0.5s 0s infinite linear;
}
.loader-13 div:nth-child(3),
.loader-13 div:nth-child(4),
.loader-13 div:nth-child(5) {
  width: 10px;
  height: 10px;
  border-radius: 50%;
  background: #2E8CF0;
  position: absolute;
  left: 100px;
  top: 20px;
  opacity: 0.7;
}
.loader-13 div:nth-child(3) {
  animation: loader13-3 1s -0.66s linear infinite;
}
.loader-13 div:nth-child(4) {
  animation: loader13-3 1s -0.33s linear infinite;
}
.loader-13 div:nth-child(5) {
  animation: loader13-3 1s 0s linear infinite;
}
</style>
