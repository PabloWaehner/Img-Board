(function() {
    Vue.component("image-modal", {
        data: function() {
            return {
                title: "",
                url: "",
                description: "",
                comment: "",
                comments: [],
                username: "",
                created_at: ""

                // imageId: ["id"]
            };
        },
        props: ["id"],
        mounted: function() {
            var self = this;
            axios
                .get("/images/" + this.id)
                .then(res => {
                    self.title = res.data.title;
                    self.url = res.data.url;
                    self.description = res.data.description;
                    self.username = res.data.username;
                    self.created_at = res.data.created_at;
                })
                .catch(err => {
                    console.log(err);
                });
            axios
                .get("/comment/" + this.id)
                .then(res => {
                    self.comments = res.data;
                })
                .catch(err => {
                    console.log(err);
                });
        },
        watch: {
            id: function() {
                var self = this;
                axios
                    .get("/images/" + this.id)
                    .then(res => {
                        self.title = res.data.title;
                        self.url = res.data.url;
                        self.description = res.data.description;
                        self.username = res.data.username;
                        self.created_at = res.data.created_at;
                    })
                    .catch(err => {
                        console.log(err);
                    });
                axios
                    .get("/comment/" + this.id)
                    .then(res => {
                        self.comments = res.data;
                    })
                    .catch(err => {
                        console.log(err);
                    });
            }
        },
        methods: {
            change: function() {},
            hidemodal: function() {
                this.$emit("close");
            },
            uploadComment: function(e) {
                var self = this;
                e.preventDefault();
                axios
                    .post("/comments", {
                        image_id: self.id,
                        username: self.username,
                        comment: self.comment
                    })
                    .then(res => {
                        self.comments.unshift(res.data.comment);
                    });
            }
        },
        template: "#id-image"
    });

    var app = new Vue({
        //si escribo window.app, en la consola puedo hacer app.algo y muestra lo que esta en el input
        el: "#main",
        data: {
            heading: "TV",
            images: [],
            title: "",
            description: "",
            username: "",
            imageId: location.hash.slice(1),
            lastImage: 0,
            idFirstImage: 0
        },
        created: function() {
            console.log("Created");
        },
        mounted: function() {
            addEventListener("hashchange", function() {
                this.imageId = location.hash.slice(1);
                if (isNaN(this.imageId)) {
                    this.imageId = null;
                    location.hash = "";
                }
            });
            var self = this;
            axios.get("/images").then(function(res) {
                self.images = res.data;
            });
        },
        methods: {
            closeModal: function() {
                this.imageId = null;
                location.hash = "";
            },
            getModal: function(id) {
                this.imageId = id;
                location.hash = this.imageId;
            },
            imageSelected: function(e) {
                // console.log(e.target == e.currentTarget); //para ver si son lo mismo, de curiosidad
                this.imageFile = e.target.files[0];
            },
            upload: function() {
                var formData = new FormData();
                formData.append("file", this.imageFile);
                formData.append("title", this.title);
                formData.append("description", this.description);
                formData.append("username", this.username);
                axios.post("/upload", formData).then(function(res) {
                    if (res.data.success) {
                        app.images.unshift(res.data.image);
                    }
                });
            },
            deleteImage: function(id) {
                axios.post("/delete/" + id).then(function(res) {
                    app.images = res.data.images;
                });
            },

            moreImages: function() {
                axios.get("/" + app.lastImage).then(function(res) {
                    console.log(res.data);
                    for (var i = 0; i < res.data.length; i++) {
                        app.images.push(res.data[i]);
                    }
                    app.lastImage = app.images[app.images.length - 1].id;
                });
            }
        }
    });
})();

//recordar no usar arrow functions para esto
