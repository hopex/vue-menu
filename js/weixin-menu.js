//API
const getMenuAPI = 'https://hopex.github.io/vue-menu/test_menu.json';
const createMenuAPI = '';
const clearMenuAPI = '';
const getMaterialAPI = 'https://hopex.github.io/vue-menu/test_material_detail.json';
const getMaterialListAPI = 'https://hopex.github.io/vue-menu/test_material.json';
const getNewsListAPI = 'https://hopex.github.io/vue-menu/test_news.json';

//Vue
new Vue({
    el: '#app-menu',
    data: {
        weixinTitle: 'Vue.js公众号菜单',
        menu: { button: [] }, //当前菜单
        selectedMenuIndex: '', //当前选中菜单索引
        selectedSubMenuIndex: '', //当前选中子菜单索引
        menuNameBounds: false, //菜单长度是否过长
        material: {
            title: '',
            url: '',
            thumb_url: '',
        },
        materialLoading:false,
        materialDialog:false,
        materialList:[],
        materialListOffset:0,
        materialListTotal:0,
        newsDialog:false,
        newsList:[],
        newsListOffset:0,
        newsListTotal:0,
        
    },
    mounted() {
        this.getMenu();
    },
    methods: {
        async getMenu() {
            try {
                let resp = await fetch(getMenuAPI);
                let res = await resp.json();
                this.menu = res.data.menu;
            } catch (err) {
                console.error(err);
                this.$message.error(err.message);
            }
        },
        //选中主菜单
        selectedMenu(i, event) {
            this.selectedSubMenuIndex = '';
            this.selectedMenuIndex = i;
            let selectedMenu = this.menu.button[this.selectedMenuIndex];
            //清空选中media_id 防止再次请求
            if (selectedMenu.media_id&& this.selectedMenuType() == 2) {
                this.getMaterial(selectedMenu.media_id);
            }
            //检查名称长度
            this.checkMenuName(selectedMenu.name);
        },
        //选中子菜单
        selectedSubMenu(i, event) {
            this.selectedSubMenuIndex = i;
            let selectedSubMenu = this.menu.button[this.selectedMenuIndex].sub_button[this.selectedSubMenuIndex];
            if (selectedSubMenu.media_id && this.selectedMenuType() == 2) {
                this.getMaterial(selectedSubMenu.media_id);
            }
            this.checkMenuName(selectedSubMenu.name);
        },
        //选中菜单级别
        selectedMenuLevel() {
            if (this.selectedMenuIndex !== '' && this.selectedSubMenuIndex === '') {
                //主菜单
                return 1;
            } else if (this.selectedMenuIndex !== '' && this.selectedSubMenuIndex !== '') {
                //子菜单
                return 2;
            } else {
                //未选中任何菜单
                return 0;
            }
        },
        //获取菜单类型 1. view网页类型，2. media_id类型和view_limited类型 3. click点击类型，4.miniprogram表示小程序类型
        selectedMenuType() {
            if (this.selectedMenuLevel() == 1 && this.menu.button[this.selectedMenuIndex].sub_button.length == 0) {
                //主菜单
                switch (this.menu.button[this.selectedMenuIndex].type) {
                    case 'view':
                        return 1;
                    case 'media_id':
                        return 2;
                    case 'view_limited':
                        return 2;
                    case 'click':
                        return 3;
                    case 'scancode_push':
                        return 3;
                    case 'scancode_waitmsg':
                        return 3;
                    case 'pic_sysphoto':
                        return 3;
                    case 'pic_photo_or_album':
                        return 3;
                    case 'pic_weixin':
                        return 3;
                    case 'location_select':
                        return 3;
                    case 'miniprogram':
                        return 4;
                }
            } else if (this.selectedMenuLevel() == 2) {
                //子菜单
                switch (this.menu.button[this.selectedMenuIndex].sub_button[this.selectedSubMenuIndex].type) {
                    case 'view':
                        return 1;
                    case 'media_id':
                        return 2;
                    case 'view_limited':
                        return 2;
                    case 'click':
                        return 3;
                    case 'scancode_push':
                        return 3;
                    case 'scancode_waitmsg':
                        return 3;
                    case 'pic_sysphoto':
                        return 3;
                    case 'pic_photo_or_album':
                        return 3;
                    case 'pic_weixin':
                        return 3;
                    case 'location_select':
                        return 3;
                    case 'miniprogram':
                        return 4;
                }
            } else {
                return 1;
            }
        },
        //添加菜单
        addMenu(level) {
            if (level == 1 && this.menu.button.length < 3) {
                this.menu.button.push({
                    type: 'view',
                    name: '菜单名称',
                    sub_button: [],
                    url: '',
                });
                this.selectedMenuIndex = this.menu.button.length - 1;
                this.selectedSubMenuIndex = '';
            }
            if (level == 2 && this.menu.button[this.selectedMenuIndex].sub_button.length < 5) {
                this.menu.button[this.selectedMenuIndex].sub_button.push({
                    type: 'view',
                    name: '子菜单名称',
                    url: '',
                });
                this.selectedSubMenuIndex = this.menu.button[this.selectedMenuIndex].sub_button.length - 1;
            }
        },
        //删除菜单
        async delMenu() {
            if (this.selectedMenuLevel() == 1 && confirm('删除后菜单下设置的内容将被删除')) {
                try {
                    await this.$confirm('删除后菜单下设置的内容将被删除', '提示');
                } catch{
                    return;
                }
                if (this.selectedMenuIndex === 0) {
                    this.menu.button.splice(this.selectedMenuIndex, 1);
                    this.selectedMenuIndex = 0;
                } else {
                    this.menu.button.splice(this.selectedMenuIndex, 1);
                    this.selectedMenuIndex -= 1;
                }
                if (this.menu.button.length == 0) {
                    this.selectedMenuIndex = '';
                }
            } else if (this.selectedMenuLevel() == 2) {
                if (this.selectedSubMenuIndex === 0) {
                    this.menu.button[this.selectedMenuIndex].sub_button.splice(this.selectedSubMenuIndex, 1);
                    this.selectedSubMenuIndex = 0;
                } else {
                    this.menu.button[this.selectedMenuIndex].sub_button.splice(this.selectedSubMenuIndex, 1);
                    this.selectedSubMenuIndex -= 1;
                }
                if (this.menu.button[this.selectedMenuIndex].sub_button.length == 0) {
                    this.selectedSubMenuIndex = '';
                }
            }
        },
        //检查菜单名称长度
        checkMenuName(val) {
            if (this.selectedMenuLevel() == 1 && this.getMenuNameLen(val) <= 8) {
                this.menuNameBounds = false;
            } else if (this.selectedMenuLevel() == 2 && this.getMenuNameLen(val) <= 16) {
                this.menuNameBounds = false;
            } else {
                this.menuNameBounds = true;
            }
        },
        //获取菜单名称长度
        getMenuNameLen(val) {
            var len = 0;
            for (var i = 0; i < val.length; i++) {
                var a = val.charAt(i);
                a.match(/[^\x00-\xff]/gi) != null ? (len += 2) : (len += 1);
            }
            return len;
        },
        //选择公众号素材库素材
        selectMaterialId() {
            this.materialDialog=true;
            this.getMaterialList();
        },
        //选择公众号图文链接
        selectNewsUrl() {
            this.newsDialog=true;
            this.getNewsList();
        },
        //设置选择的素材id
        setMaterialId(row) {
            let {media_id,content}=row;
            if (this.selectedMenuLevel() == 1) {
                this.$set(this.menu.button[this.selectedMenuIndex],'media_id',media_id);
            } else if (this.selectedMenuLevel() == 2) {
                this.$set(this.menu.button[this.selectedMenuIndex].sub_button[this.selectedSubMenuIndex],'media_id',media_id);
            }
            let {news_item}=content;
            let item=news_item[0];
            this.material.title = item.title;
            this.material.url = item.url;
            this.materialDialog=false;
        },
        //删除选择的素材id
        delMaterialId(){
            if (this.selectedMenuLevel() == 1) {
                this.$set(this.menu.button[this.selectedMenuIndex],'media_id','');
            } else if (this.selectedMenuLevel() == 2) {
                this.$set(this.menu.button[this.selectedMenuIndex].sub_button[this.selectedSubMenuIndex],'media_id','');
            }
        },
        //设置选择的图文链接
        setNewsUrl(row) {
            let {url}=row
            if (this.selectedMenuLevel() == 1) {
                this.$set(this.menu.button[this.selectedMenuIndex], 'url', url);
            } else if (this.selectedMenuLevel() == 2) {
                this.$set(this.menu.button[this.selectedMenuIndex].sub_button[this.selectedSubMenuIndex], 'url', url);
            }
            this.newsDialog=false;
        },
        //获取素材信息
        async getMaterial(id) {
            this.materialLoading=true;
            try {
                let url = `${getMaterialAPI}?${new URLSearchParams({
                    media_id: id,
                })}`;
                let resp = await fetch(url);
                let res = await resp.json();
                this.material.title = res.data.news_item[0].title;
                this.material.url = res.data.news_item[0].url;
            } catch(err){
                console.error(err)
            }
            this.materialLoading=false;
        },
        async getNewsList() {
            if(this.newsListOffset>0&&this.newsListOffset>=this.newsListOffset){
                return;
            }
            try {
                let url = `${getNewsListAPI}?${new URLSearchParams({
                    type: 'news',
                    offset: this.newsListOffset,
                    count: 20,
                })}`;
                let resp = await fetch(url);
                let res = await resp.json();
                this.newsList=this.newsList.concat(res.data.item)
                this.newsListOffset += res.data.item_count;
                this.newsListTotal = res.data.total_count;
            } catch(err){
                console.error(err)
            }
        },
        async getMaterialList() {
            if(this.materialListOffset>0&&this.materialListOffset>=this.materialListTotal){
                return;
            }
            try {
                let url = `${getMaterialListAPI}?${new URLSearchParams({
                    type: 'news',
                    offset: this.materialListOffset,
                    count: 20,
                })}`;
                let resp = await fetch(url);
                let res = await resp.json();
                this.materialList=this.materialList.concat(res.data.item)
                this.materialListOffset += res.data.item_count;
                this.materialListTotal = res.data.total_count;
            } catch(err){
                console.error(err)
            }
        },
        async onMenuSubmit() {
            try {
                await this.$confirm('确定后发布当前自定义菜单', '提示');
                //TODO submitAPI
                this.$message.success('发布成功');
                console.log(
                    JSON.stringify(this.menu)
                );
            } catch(err){
                console.error(err)
            }
        },
        async onMenuClear() {
            try {
                await this.$confirm('确定后将清空后公众号自定义菜单', '提示');
                //TODO clearAPI
                this.$message.success('清空成功');
                this.menu.button=[]
            } catch(err){
                console.error(err)
            }
        },
    },
});
