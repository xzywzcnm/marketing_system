// 处理下拉列表
class dropdownComfun {
  constructor() { }
  /* 
    功能：公用下拉
    参数：
        data:数据
        defaultData: powerList:权限列表;multipleSelection:勾选中的表格列表；total：表格总条数
  */
  commonList(data, defaultData) {
    let power = defaultData.powerList[data.power];
    let command = data.command || [];
    let disableds = data.disabled || [];
    const disabled0 = !!disableds[0];
    const disabled1 = typeof disableds[1] === 'boolean' ? disableds[1] : !defaultData.multipleSelection.length;
    const disabled2 = typeof disableds[2] === 'boolean' ? disableds[2] : !defaultData.total;
    return [
      {
        label: data.label || '操作',
        power,
        disabled: disabled0,
        command: command.length > 1 ? command[0] : 0,
      },
      {
        label: data.mulName || "选中链接",
        power,
        disabled: disabled1,
        command: command.length > 2 ? command[1] : 1,
        loading: data.loading1,
      },
      {
        label: data.totalName || "所有结果集",
        power,
        disabled: disabled2,
        command: command.length > 3 ? command[2] : 2,
        loading: data.loading2,
      },
    ];
  }
}

export default new dropdownComfun();