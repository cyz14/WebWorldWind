# s2cell#n_cells.json

json 格式解析后 jsonObj 直接读取即可

# s2level#n_cells.txt

格式太过复杂我先不导出。
s2 从 level 0 到 level 5 的分区数据
第一行为一个整数 level , 0 <= level < 6
第二行为一个整数 ncells, 6 <= ncells 
第 3 到 ncells*4+3 每行为两个实数，分别为一个点的纬度 lat 和经度 lng

每个cell都是四个点，按照地表逆时针顺序排列
