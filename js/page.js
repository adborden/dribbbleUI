(function() {
var
    DribbbleCollection = Backbone.View.extend({
        initialize: function(params) {
            this.name = params.name;
            this.page = 1;
            this.$el.addClass(this.name);
        },
        per_page: 9, //TODO makeconfigurable
        endpoint: 'http://api.dribbble.com/shots/',
        next: function() {
            if (!this.is_fetching) {
                this.fetch(this.page++);
            }
        },
        fetch: function(page) {
            console.log('fetching ' + this.name);
            var params = {
                data: {
                    page: page,
                    per_page: this.per_page
                },
                url: this.endpoint + this.name,
                dataType: 'jsonp'
            };

            this.is_fetching = true;
            $.ajax(params).success(function(result) {
                result.shots.forEach(function(shot) {
                    this.add(shot);
                }.bind(this));
            }.bind(this)).error(function() {
                alert("Awwz, we can't find any more designs right now.");
            }).complete(function() {
                this.is_fetching = false;
            }.bind(this));
        },
        reset: function() {
            this.$('#designs .shot').remove();
            this.page = 1;
        },
        template: _.template('<div id="<%= id %>" class="shot four columns"><a href="<%= url %>"><img src="<%= image_teaser_url %>" /></a></div>'), //TODO move to XHR or HTML
        add: function(shot) {
            this.$el.append(this.template(shot));
        },
        onScroll: function(event) {
            var fromBottom = $(document).height() - ($(document).scrollTop() + window.innerHeight);
            if (fromBottom < 300) {
                this.next();
            }
        },
        show: function(show) {
            if (show === false) {
                this.$el.remove();
                $(window).off('scroll');
            } else {
                this.$el.appendTo('#designs');
                $(window).on('scroll', this.onScroll.bind(this));
            }
        }
    }),
    Navigation = Backbone.View.extend({
        initialize: function(options) {
            this.collections = {};
            this.$('.collection').each(function(i, nav) {
                this.add(nav);
            }.bind(this));
        },
        events: {
            'click .collection': 'select'
        },
        add: function(el) {
            var collection = $(el).attr('id');
            
            this.collections[collection] = new DribbbleCollection({name: collection});
            this.collections[collection].next(); // Fetch first page
            if (!this.selected) {
                this.selected = collection;
                this.select(collection);
            }
        },
        select: function(item /* string or Event */) {
            var collection = typeof item == 'object' ?
                $(item.target).closest('.collection').attr('id') :
                item;
            if (!collection) {
                return;
            }

            var old_collection = this.$('.collection.selected').removeClass('selected').attr('id');
            this.$('#' + collection).addClass('selected');
            if (old_collection == collection) {
                return;
            }

            if (old_collection in this.collections) {
                this.collections[old_collection].show(false);
            }

            this.collections[collection].show();
        }
    });

    $(document).ready(function() {
        var nav = new Navigation({el: '#nav'});
    });
})()
