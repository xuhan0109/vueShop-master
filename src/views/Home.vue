<template>
  <el-container class="home_container">
    <!-- 头部区域 -->
    <el-header>
      <div class="title_box">
        <img src="../assets/logo.png" alt="电商后台管理系统">
        <span>后台管理系统</span>
      </div>
      <el-button type="info" @click="logout">退出</el-button>
    </el-header>
    <!-- 页面主体区域 -->
    <el-container>
      <!-- 侧边栏 -->
      <el-aside :width="isCollapse ? '64px' : '200px'">
        <!-- 折叠按钮 -->
        <div class="toggle-button" @click="toggleCollapse">|||</div>
        <!-- 侧边栏菜单区 -->
        <el-menu
          router
          :default-active="activePath"
          :collapse-transition="false"
          :collapse="isCollapse"
          unique-opened
          background-color="#333744"
          text-color="#fff"
          active-text-color="#4090fe">
          <!-- 一级菜单 -->
          <el-submenu :index="menu.id + ''" v-for="menu in menulist" :key="menu.id">
            <!-- 一级菜单模板区 -->
            <template slot="title">
              <!-- 图标 -->
              <i :class="iconObj[menu.id]"></i>
              <!-- 文本 -->
              <span>{{menu.authName}}</span>
            </template>

            <!-- 二级菜单 -->
            <el-menu-item :index="'/' + subItem.path" v-for="subItem in menu.children" :key="subItem.id" @click="saveNavState('/' + subItem.path)">
              <!-- 图标 -->
              <i class="el-icon-menu"></i>
              <!-- 文本 -->
              <span>{{subItem.authName}}</span>
            </el-menu-item>
          </el-submenu>
        </el-menu>
      </el-aside>
      <!-- 右侧内容主体 -->
      <el-main>
        <router-view></router-view>
      </el-main>
    </el-container>
  </el-container>
</template>
<script>
export default {
  name: 'Home',
  data(){
    return {
      // 左侧菜单数据
      menulist: [],
      // 一级菜单icon图标
      iconObj: {
        '125': 'el-icon-s-custom',
        '103': 'el-icon-lock',
        '101': 'el-icon-s-goods',
        '102': 'el-icon-s-order',
        '145': 'el-icon-data-line'
      },
      // 控制菜单是否展开/折叠
      isCollapse: true,
      // 被激活的链接地址
      activePath: ''
    }
  },
  created () {
    this.getMenuList()
    this.activePath = sessionStorage.getItem('activePath')
  },
  methods: {
    // 退出登录
    logout() {
      sessionStorage.clear()
      this.$router.push('/login')
    },
    // 获取所有的菜单
    async getMenuList() {
      const {data: res} = await this.$http.get('menus')
      if(res.meta.status !== 200) return this.$message.error(res.meta.msg);
      this.menulist = res.data
    },
    // 点击按钮，切换菜单的折叠
    toggleCollapse(){
      this.isCollapse = !this.isCollapse
    },
    // 保存链接的激活状态
    saveNavState(activePath) {
      sessionStorage.setItem('activePath', activePath)
      this.activePath = activePath
    }
  },
}
</script>

<style lang="less" scoped>
  .home_container {
    height: 100%;
  }

  .el-header {
    background-color: #373d41;
    color: #fff;
    display: flex;
    justify-content: space-between;
    align-items: center;

    .title_box {
      display: flex;
      align-items: center;

      span {
        font-size: 26px;
      }

      img {
        width: 8%;
        border-radius: 50%;
        margin-right: 10px;
      }
    }
  }

  .el-aside {
    background-color: #333744;
    color: #fff;
    .el-menu {
      border-right: none;
    }
  }
  
  .el-main {
    background-color: #eaedf1;
  }

  .toggle-button {
    background-color: #4a5064;
    font-size: 10px;
    line-height: 24px;
    color: #fff;
    text-align: center;
    letter-spacing: 0.2em;
    cursor: pointer;
  }
</style>
