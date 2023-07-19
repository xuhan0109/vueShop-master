<template>
  <div>
    <!-- 面包屑导航区域 -->
    <Breadcrumb :menuData="menuData"></Breadcrumb>
    <!-- 卡片视图区域 -->
    <el-card class="box-card">
      <!-- 搜索与添加区域 -->
      <el-row :gutter="10">
        <el-col :span="8">
          <el-input placeholder="请输入内容" v-model="queryInfo.query" clearable @clear="getUserList">
            <el-button slot="append" icon="el-icon-search" @click="getUserList"></el-button>
          </el-input>
        </el-col>
        <el-col :span="4">
          <el-button type="primary" @click="dialogTableVisible = true">添加用户</el-button>
        </el-col>
      </el-row>

      <!-- 用户列表展示区域 -->
      <el-table border :data="userList" style="width: 100%">
        <el-table-column type="index" label="#"> </el-table-column>
        <el-table-column prop="username" label="姓名"> </el-table-column>
        <el-table-column prop="email" label="邮箱"> </el-table-column>
        <el-table-column prop="mobile" label="电话"> </el-table-column>
        <el-table-column prop="role_name" label="角色"> </el-table-column>
        <el-table-column label="状态">
          <template slot-scope="scope">
            <el-switch v-model="scope.row.mg_state" @change="switchUserStateChanged(scope.row)"></el-switch>
          </template>
        </el-table-column>
        <el-table-column label="操作" width="180px">
          <template slot-scope="scope">
            <!-- 修改按钮 -->
            <el-tooltip class="item" effect="dark" content="修改角色" placement="top" :enterable="false">
              <el-button @click="editUser(scope.row.id)" size="mini" type="primary" icon="el-icon-edit"></el-button>
            </el-tooltip>
            <!-- 删除按钮 -->
            <el-tooltip class="item" effect="dark" content="删除角色" placement="top">
              <el-button @click="deleteUser(scope.row.id)" size="mini" type="danger" icon="el-icon-delete"></el-button>
            </el-tooltip>
            <!-- 分配角色按钮 -->
            <el-tooltip class="item" effect="dark" content="分配角色" placement="top">
              <el-button @click="allotUserRole(scope.row)" size="mini" type="warning" icon="el-icon-setting"></el-button>
            </el-tooltip>
          </template>
        </el-table-column>
      </el-table>

      <!-- 分页区域 -->
      <el-pagination
        @size-change="handleSizeChange"
        @current-change="handleCurrentChange"
        :current-page="queryInfo.pagenum"
        :page-sizes="[2, 4, 6, 8]"
        :page-size="queryInfo.pagesize"
        layout="total, sizes, prev, pager, next, jumper"
        :total="total">
      </el-pagination>
    </el-card>

    <!-- 添加用户的对话框 -->
    <el-dialog title="添加用户" :visible.sync="dialogTableVisible" @close="addDialogClosed" width="50%">
      <!-- 添加用户form表单 -->
      <el-form :model="addForm" :rules="addFormRules"  label-width="70px" class="demo-ruleForm" ref="addFormRef">
        <el-form-item label="用户名" prop="username">
          <el-input v-model="addForm.username"></el-input>
        </el-form-item>
        <el-form-item label="密码" prop="password">
          <el-input v-model="addForm.password"></el-input>
        </el-form-item>
        <el-form-item label="邮箱" prop="email">
          <el-input v-model="addForm.email"></el-input>
        </el-form-item>
        <el-form-item label="手机" prop="mobile">
          <el-input v-model="addForm.mobile"></el-input>
        </el-form-item>
      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button @click="cancelAdd">取 消</el-button>
        <el-button type="primary" @click="addUser">确 定</el-button>
      </div>
    </el-dialog>  

    <!-- 修改用户的对话框 -->
    <el-dialog title="编辑用户" :visible.sync="editDialogVisible"  width="50%">
      <!-- 添加用户form表单 -->
      <el-form :model="editForm" :rules="addFormRules"  label-width="70px" class="demo-ruleForm" ref="editFormRef">
        <el-form-item label="用户名">
          <el-input v-model="editForm.username" disabled></el-input>
        </el-form-item>
        <el-form-item label="邮箱" prop="email">
          <el-input v-model="editForm.email"></el-input>
        </el-form-item>
        <el-form-item label="手机" prop="mobile">
          <el-input v-model="editForm.mobile"></el-input>
        </el-form-item>
      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button @click="editDialogClosed">取 消</el-button>
        <el-button type="primary" @click="submitEditUser()">确 定</el-button>
      </div>
    </el-dialog>  

    <!-- 分配角色的对话框 -->
    <el-dialog title="分配角色" :visible.sync="setRoleDialogVisible" width="50%" @close="cancelSetRole">
      <p>当前用户：{{userInfo.username}}</p>
      <p>当前角色：{{userInfo.role_name}}</p>
      <p>分配新角色：</p>
      <el-select v-model="value" placeholder="请选择">
        <el-option
          v-for="item in roleList"
          :key="item.id"
          :label="item.roleName"
          :value="item.id">
        </el-option>
      </el-select>
      <span slot="footer" class="dialog-footer">
        <el-button @click="cancelSetRole">取 消</el-button>
        <el-button type="primary" @click="submitSetRole(userInfo.id)">确 定</el-button>
      </span>
    </el-dialog>
  </div>
</template>

<script>
  import Breadcrumb from '../../components/Breadcrumb'
  export default {
    components: { Breadcrumb },
    name: 'Users',
    data(){
      // 自定义邮箱校验规则
      // let checkEmail = (rule, value, cb) => {
      //   const regEmail = /^([a-zA-z0-9_-])+@([a-zA-z0-9_-])+(\.[z-zA-z0-9_-])+/
      //   if(regEmail.test(value)) {
      //     return cb()
      //   }
      //   cb(new Error('请输入合法的邮箱！'))
      // }
      // 自定义手机号校验规则
      let checkMobile = (rule, value, cb) => {
        const regMobile = /^((\+?86)|(\(\+86\)))?1\d{10}$/
        if(regMobile.test(value)) {
          return cb()
        }
        cb(new Error('请输入合法的手机号！'))
      }
      return {
        // 传给面包屑的数据
        menuData: ['用户管理','用户列表'],
        // 获取用户列表的参数对象
        queryInfo: {
          query: '',
          pagenum: 1,
          pagesize: 4
        },
        // 用户列表数据
        userList: [],
        // 用户列表总数
        total: 0,
        // 控制添加用户对话框显示隐藏
        dialogTableVisible: false,
        // 控制编辑用户对话框显示隐藏
        editDialogVisible: false,
        // 控制分配角色对话框显示隐藏
        setRoleDialogVisible: false,
        // 添加用户的表单数据
        addForm: {
          username: '',
          password: '',
          email: '',
          mobile: ''
        },
        // 添加表单验证规则对象
        addFormRules: {
          username: [
            {required: true, message: '请输入用户名', trigger: 'blur'},
            {min: 3, max: 10, message: '用户名的长度在3~10个字符之间', trigger: 'blur'}
          ],
          password: [
            {required: true, message: '请输入密码', trigger: 'blur'},
            {min: 6, max: 15, message: '用户名的长度在6~15个字符之间', trigger: 'blur'}
          ],
          email: [
            {required: true, message: '请输入邮箱', trigger: 'blur'},
            // {validator: checkEmail}
          ],
          mobile: [
            {required: true, message: '请输入手机', trigger: 'blur'},
            {validator: checkMobile}
          ]
        },
        // 根据id查询的用户信息对象
        editForm: {},
        // 点击分配角色按钮保存的用户信息
        userInfo: {},
        // 所有角色的数据列表
        roleList: [],
        // 用以保存用户选择的角色
        value: ''
      }
    },
    created () {
      this.getUserList()
    },
    methods: {
      // 获取用户列表
      async getUserList(){
        // console.log(this.queryInfo);
        const {data: res} = await this.$http.get('users', {params: this.queryInfo})
        if(res.meta.status !== 200) return this.$message.error(res.meta.msg)
        this.userList = res.data.users
        this.total = res.data.total
      },
      // 监听 pagesize 改变的事件
      handleSizeChange(newSize) {
        this.queryInfo.pagesize = newSize
        this.getUserList()
      },
      // 监听 页码值 改变的事件
      handleCurrentChange(newPage) {
        this.queryInfo.pagenum = newPage
        this.getUserList()
      },
      // 展示编辑用户的对话框
      async editUser(id) {
        this.editDialogVisible = true
        const {data: res} = await this.$http.get(`users/${id}`)
        if(res.meta.status !== 200) return this.$message.error(res.meta.msg)
        this.editForm = res.data
      },
      // 删除用户
      deleteUser(id) {
        this.$confirm('是否确认删除给用户?', '提示', {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          type: 'warning'
        }).then(async () => {
          const {data:res} = await this.$http.delete(`users/${id}`)
          if(res.meta.status !== 200) return this.$message.error("删除失败！")
          this.$message({
            type: 'success',
            message: '删除成功!'
          });
          this.getUserList()
        }).catch(() => {
          this.$message({
            type: 'info',
            message: '已取消删除'
          });          
        });
      },
      // 分配用户角色
      async allotUserRole(userInfo) {
        // console.log(userInfo);
        this.userInfo = userInfo
        const {data: res} = await this.$http.get('roles')
        console.log(res);
        if(res.meta.status !== 200) return this.$message.error("获取角色列表失败！")
        this.$message.success("获取角色列表成功！")
        this.roleList = res.data
        this.setRoleDialogVisible = true
      },
      // 更新用户状态
      async switchUserStateChanged({id: uId, mg_state: type}) {
        const {data:res} = await this.$http.put(`users/${uId}/state/${type}`)
        if(res.meta.status !== 200) return this.$message.error(res.meta.msg)
        this.$message.success(res.meta.msg)
        // this.getUserList()
      },
      // 监听添加用户对话框的关闭事件
      addDialogClosed(){
        this.$refs.addFormRef.resetFields()
      },
      // 取消添加
      cancelAdd() {
        this.dialogTableVisible = false
        this.$refs.addFormRef.resetFields()
      },
      // 点击按钮添加新用户
      addUser(){
        this.$refs.addFormRef.validate(async valid => {
          if(!valid) return this.$message.error("请检查输入是否正确")
          // 可以发起添加用户的网络请求
          const {data: res} = await this.$http.post('users', this.addForm)
          console.log(res);
          if(res.meta.status !== 201) return this.$message.error(res.meta.msg)
          this.$message.success(res.meta.msg)
          this.dialogTableVisible = false
          this.getUserList()
        })
      },
      // 监听修改用户对话框的关闭事件
      editDialogClosed() {
        this.editDialogVisible = false
        this.$refs.editFormRef.resetFields()
      },
      // 提交编辑后的用户信息
      submitEditUser() {
        this.$refs.editFormRef.validate(async valid => {
          if(!valid) return this.$message.error("请检查输入是否正确！")
          const {data:res} = await this.$http.put(`users/${this.editForm.id}`, this.editForm)
          if(res.meta.status !== 200) return this.$message.error(res.meta.msg)
          this.editDialogVisible = false
          this.getUserList()
          this.$message.success(res.meta.msg)
        })
      },
      // 点击分配角色取消的按钮
      cancelSetRole() {
        this.setRoleDialogVisible = false
        this.value = ''
      },
      // 提交重新分配的角色数据
      async submitSetRole(userId) {
        console.log(this.value);
        if(!this.value) return this.$message.error("请选择要分配的角色！")
        const {data: res} = await this.$http.put(`users/${userId}/role`, {rid: this.value})
        if(res.meta.status !== 200) return this.$message.error(res.meta.msg)
        this.$message.success(res.meta.msg)
        this.getUserList()
        this.setRoleDialogVisible = false
        this.value = ''
      }
    }
  }
</script>

<style lang="less" scoped>
  .el-table {
    margin-top: 20px;
    font-size: 12px;
  }

  .el-pagination {
    margin-top: 20px;
  }

</style>