<template>
  <div>
    <!-- 面包屑导航区域 -->
    <Breadcrumb  :menuData="menuData"></Breadcrumb>

    <!-- 卡片视图区域 -->
    <el-card>
      <!-- 添加角色按钮区域 -->
      <el-row>
        <el-col>
          <el-button type="primary" @click="dialogVisible = true">添加角色</el-button>
        </el-col>
      </el-row>
      <!-- 角色列表展示区域 -->
      <el-table :data="rolesList" border style="width: 100%;margin-top:20px">
        <el-table-column type="expand">
          <template slot-scope="props">
            <el-row class="row_display" style="margin: 0 48px" :class="['line_bottom', i1 === 0 ? 'line_top' : '']" v-for="(levelOne, i1) in props.row.children" :key="levelOne.id">
              <!-- 渲染一级权限 -->
              <el-col :span="5">
                <el-tag closable @close="deleteRightsById(props.row, levelOne.id)">{{levelOne.authName}}</el-tag>
                <i class="el-icon-caret-right"></i>
              </el-col>
              <!-- 渲染二级和三级权限 -->
              <el-col :span="19">
                <el-row class="row_display" :class="[i2 === levelOne.children.length - 1 ? '' : 'line_bottom']" v-for="(item1, i2) in levelOne.children" :key="item1.id">
                  <el-col :span="6">
                    <el-tag closable type="success" @close="deleteRightsById(props.row, item1.id)">{{item1.authName}}</el-tag> 
                    <i class="el-icon-caret-right"></i>
                  </el-col>
                  <el-col :span="18">
                    <el-tag closable v-for="(item2) in item1.children" :key="item2.id" type="warning" @close="deleteRightsById(props.row, item2.id)">{{item2.authName}}</el-tag>
                  </el-col>
                </el-row>
              </el-col>
            </el-row>
            <!-- <pre>{{props.row}}</pre> -->
          </template>
        </el-table-column>
        <el-table-column label="#" type="index"> </el-table-column>
        <el-table-column label="角色名称" prop="roleName"> </el-table-column>
        <el-table-column label="角色描述" prop="roleDesc"> </el-table-column>
        <el-table-column label="操作" width="330px">
          <template slot-scope="scope">
            <el-button size="mini" type="primary" icon="el-icon-edit" @click="editRole(scope.row.id)">编辑</el-button>
          <el-button size="mini" type="danger" icon="el-icon-delete" @click="removeRightsById(scope.row.id)">删除</el-button>
          <el-button size="mini" type="warning" icon="el-icon-setting" @click="showSetRightDialog(scope.row)">分配权限</el-button>
          </template>
        </el-table-column>
      </el-table>
    </el-card>

    <!-- 添加角色对话框 -->
    <el-dialog title="添加角色" :visible.sync="dialogVisible" width="50%" @close="addDialogClosed">
      <el-form :model="addRights" label-width="70px" class="demo-ruleForm" ref="addRightsRef">
        <el-form-item label="角色名称" prop="roleName">
          <el-input v-model="addRights.roleName"></el-input>
        </el-form-item>
        <el-form-item label="角色描述" prop="roleDesc">
          <el-input v-model="addRights.roleDesc"></el-input>
        </el-form-item>
      </el-form>
      <span slot="footer" class="dialog-footer">
        <el-button @click="addDialogClosed">取 消</el-button>
        <el-button type="primary" @click="submitRights">确 定</el-button>
      </span>
    </el-dialog>

    <!-- 编辑角色对话框 -->
    <el-dialog title="添加角色" :visible.sync="editDialogVisible" width="50%" @close="editDialogClosed">
      <el-form :model="editRights" label-width="70px" class="demo-ruleForm" ref="editRightsRef">
        <el-form-item label="角色名称" prop="roleName">
          <el-input v-model="editRights.roleName"></el-input>
        </el-form-item>
        <el-form-item label="角色描述" prop="roleDesc">
          <el-input v-model="editRights.roleDesc"></el-input>
        </el-form-item>
      </el-form>
      <span slot="footer" class="dialog-footer">
        <el-button @click="editDialogClosed">取 消</el-button>
        <el-button type="primary" @click="submitEditRights">确 定</el-button>
      </span>
    </el-dialog>

    <!-- 分配角色权限对话框 -->
    <el-dialog title="分配角色权限" :visible.sync="setRightDialog" width="50%" @close="removeRights">
      <el-tree :data="menuList" :props="defaultProps" node-key="id" show-checkbox default-expand-all ref="treeRef" :default-checked-keys="defKeys">
      </el-tree>
      <span slot="footer" class="dialog-footer">
        <el-button @click="setRightDialog = false">取 消</el-button>
        <el-button type="primary" @click="allotRights">确 定</el-button>
      </span>
    </el-dialog>
  </div>
</template>

<script>
  import Breadcrumb from '../../components/Breadcrumb'
  export default {
    name: 'Roles',
    components: {
      Breadcrumb
    },
    data() {
      return {
        // 传给面包屑的数据
        menuData: ['权限管理','角色列表'],
        // 角色列表数据
        rolesList: [],
        // 添加角色数据
        addRights: {
          roleName: '',
          roleDesc: ''
        },
        // 编辑角色数据
        editRights: {},
        // 菜单权限列表
        menuList: [],
        // 默认展开项数据
        defaultProps: {
          children: 'children',
          label: 'authName'
        },
        // 默认选中的权限
        defKeys: [],
        // 控制添加角色对话框显示隐藏
        dialogVisible: false,
        // 控制分配角色对话框显示隐藏
        setRightDialog: false,
        // 控制编辑角色对话框显示隐藏
        editDialogVisible: false,
        // 分配权限时的角色id
        roleId: ''
      }
    },
    created () {
      this.getRolesList()
    },
    methods: {
      // 获取所有角色列表
      async getRolesList() {
        const {data: res} = await this.$http.get('roles')
        if(res.meta.status !== 200) return this.$message.error("获取角色列表数据失败！");
        this.rolesList = res.data
      },
      // 获取权限列表
      async getMenuList() {
        const {data: res} = await this.$http.get('rights/tree')
        if(res.meta.status !== 200) return this.$message.error("获取菜单权限数据失败！");
        this.menuList = res.data
      },
      // 根据id删除角色
      removeRightsById(id) {
        this.$confirm('是否确认删除该角色?', '提示', {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          type: 'warning'
        }).then(async () => {
          const {data: res} = await this.$http.delete(`roles/${id}`)
          if(res.meta.status !== 200) return this.$message.error("删除角色失败！")
          this.$message.success("删除角色成功!")
          this.getRolesList()
        }).catch(() => {
          this.$message({
            type: 'info',
            message: '已取消删除'
          });          
        });
      },
      // 添加角色
      async submitRights() {
        if(!this.addRights.roleName) return this.$message.error('请输入角色名称！')
        const {data: res} = await this.$http.post('roles', this.addRights)
        if(res.meta.status !== 201) return this.$message.error('添加角色失败！')
        this.$message.success("添加角色成功！")
        this.getRolesList()
        this.dialogVisible = false
      },
      // 根据角色id和权限id删除角色指定权限
      deleteRightsById(role,rightId) {
        this.$confirm('是否确认删除该权限?', '提示', {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          type: 'warning'
        }).then(async () => {
          const {data: res} = await this.$http.delete(`roles/${role.id}/rights/${rightId}`)
          if(res.meta.status !== 200) return this.$message.error("删除权限失败！")
          this.$message.success("删除权限成功!")
          // this.getRolesList()  // 调用给方法会导致整个页面刷新，从而关闭展开的行
          role.children = res.data // 把最新数据赋值给role.children不会关闭
        }).catch(() => {
          this.$message({
            type: 'info',
            message: '已取消删除'
          });          
        });
      },
      // 监听对话框关闭事件
      addDialogClosed(){
        this.$refs.addRightsRef.resetFields()
        this.dialogVisible = false
      },
      editDialogClosed(){
        this.$refs.editRightsRef.resetFields()
        this.editDialogVisible = false
      },
      // 展示分配权限的对话框
      showSetRightDialog(scope) {
        this.roleId = scope.id
        // 获取权限列表
        this.getMenuList()
        this.getLeafKeys(scope, this.defKeys)
        this.setRightDialog = true
      },
      // 使用递归的形式，获取角色下所有三级权限的id，并保存到defKeys这个
      getLeafKeys(node, arr) {
        if(!node.children) {
          return arr.push(node.id)
        }

        node.children.forEach(item => {
          this.getLeafKeys(item, arr)
        })
      },
      // 监听分配角色对话框显示隐藏
      removeRights() {
        this.defKeys = []
      },
      // 点击为角色分配权限
      async allotRights() {
        this.setRightDialog = false
        const keys = [...this.$refs.treeRef.getCheckedKeys(),...this.$refs.treeRef.getHalfCheckedKeys()]
        // console.log(keys);
        const idStr = keys.join(',')
        const {data: res} = await this.$http.post(`roles/${this.roleId}/rights`, {rids: idStr})
        // console.log(res);
        if(res.meta.status !== 200) return this.$message.error("分配角色失败！")
        this.$message.success("分配角色成功！")
        this.getRolesList()
      },
      // 编辑角色
      async editRole(id) {
        this.editDialogVisible = true
        const {data: res} = await this.$http.get(`roles/${id}`)
        this.editRights = res.data
      },
      // 提交编辑后的角色信息
      async submitEditRights() {
        const {data: res} = await this.$http.put(`roles/${this.editRights.roleId}`, this.editRights)
        if(res.meta.status !== 200) return this.$message.error("角色更新失败！")
        this.$message.success("角色更新成功！")
        this.getRolesList()
        this.editDialogVisible = false
      }
    }
  }
</script>

<style scoped>
  .el-tag {
    margin: 7px;
  }

  .line_bottom {
    border-bottom: 1px solid #eee;
  }

  .line_top:first-child {
    border-top: 1px solid #eee;
  }

  .row_display {
    display: flex;
    align-items: center;
  }
</style>