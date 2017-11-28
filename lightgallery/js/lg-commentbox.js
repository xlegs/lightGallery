/**
 * @desc lightGallery comments module
 * Supports facebook and google plus comments
 * 
 * @ref - https://paulund.co.uk/add-google-comments-to-your-site
 * @ref - https://help.disqus.com/customer/portal/articles/472098-javascript-configuration-variables
 * @ref - https://github.com/disqus/DISQUS-API-Recipes/blob/master/snippets/js/disqus-reset/disqus_reset.html
 * @ref - https://css-tricks.com/lazy-loading-disqus-comments/
 * 
 */

(function () {

    'use strict';

    var defaults = {
        commentBox: true,
        fbComments: false,
        googlePlusComments: false,
        disqusComments: true,
        disqusConfig: {
            title: undefined,
            language: 'en'
        },
        fbCommentsMarkup: '<div id="lg-comment-box" class="lg-comment-box lg-fb-comment-box"><div class="lg-comment-header"><h3 class="lg-comment-title">Leave a comment.</h3><span id="lg-comment-close"  class="lg-icon"></span></div><div id="lg-comment-body"></div></div>',
    };

    var CommentBox = function (element) {

        this.core = $(element).data('lightGallery');

        this.core.s = $.extend({}, defaults, this.core.s);

        if (this.core.s.commentBox) {
            this.init();
        }

        return this;
    };


    CommentBox.prototype.init = function () {
        var _this = this;
        this.setMarkup();
        this.toggleCommentBox();
        if (this.core.s.fbComments) {
            this.addFbComments();
        } else if (this.core.s.googlePlusComments) {
            this.addGPlusComments();
        } else if (this.core.s.disqusComments) {
            this.addDisqusComments();
        }
    };

    CommentBox.prototype.setMarkup = function () {

        this.core.$outer.find('.lg').append(this.core.s.fbCommentsMarkup + '<div id="lg-comment-overlay"></div>');

        var commentToggleBtn = '<span id="lg-comment-toggle" class="lg-icon"></span>';
        this.core.$outer.find('.lg-toolbar').append(commentToggleBtn);
    }

    CommentBox.prototype.toggleCommentBox = function () {

        var _this = this;
        $('#lg-comment-toggle').on('click.lg', function () {
            _this.core.$outer.toggleClass('lg-comment-active');
        });

        $('#lg-comment-overlay, #lg-comment-close').on('click.lg', function () {
            _this.core.$outer.removeClass('lg-comment-active');
        });
    }

    CommentBox.prototype.addGPlusComments = function () {
        var _this = this;
        this.core.$el.on('onBeforeSlide.lg.tm', function (event, prevIndex, index) {
            $('#lg-comment-body').html('');
        });
        this.core.$el.on('onAfterSlide.lg.tm', function (event, prevIndex, index) {
            try {
                gapi.comments.render('lg-comment-body', {
                    href: _this.core.$items.eq(index).attr('data-googleplus-comment-url') || window.location,
                    width: '400',
                    first_party_property: 'BLOGGER',
                    view_type: 'FILTERED_POSTMOD'
                });
            } catch (err) {
                console.error('Make sure you have included plusone.js in your document - https://apis.google.com/js/plusone.js');
            }
        });
    }

    CommentBox.prototype.addFbComments = function () {

        var _this = this;
        this.core.$el.on('onBeforeSlide.lg.tm', function (event, prevIndex, index) {
            $('#lg-comment-body').html(_this.core.$items.eq(index).attr('data-fb-html'));
        });
        this.core.$el.on('onAfterSlide.lg.tm', function () {
            try {
                FB.XFBML.parse();
            } catch (err) {
                $(window).on('fbAsyncInit', function () {
                    FB.XFBML.parse();
                });
            }
        });
    }

    CommentBox.prototype.addDisqusComments = function () {

        var _this = this;
        $('#disqus_thread').remove();
        $('#lg-comment-body').append('<div id="disqus_thread"></div>');

        this.core.$el.on('onBeforeSlide.lg.tm', function (event, prevIndex, index) {
            $('#disqus_thread').html('');
        });

        this.core.$el.on('onAfterSlide.lg.tm', function (event, prevIndex, index) {

            // DISQUS needs sometime to intialize when lightGallery is opened from direct url(hash plugin).
            setTimeout(function () {
                try {
                    DISQUS.reset({
                        reload: true,
                        config: function () {
                            this.page.identifier = _this.core.$items.eq(index).attr('data-disqus-identifier');
                            this.page.url = _this.core.$items.eq(index).attr('data-disqus-url');
                            this.page.title = this.core.s.disqusConfig.title;
                            this.language = this.core.s.disqusConfig.language;
                        }
                    });
                } catch (err) {
                    console.error('Make sure you have included disqus JavaScript code in your document. Ex - https://lg-disqus.disqus.com/admin/install/platforms/universalcode/');
                }
            }, _this.core.lGalleryOn ? 0 : 1000);
        });
    }

    CommentBox.prototype.destroy = function () {

        this.core.$el.off('.lg.comment');
    };

    $.fn.lightGallery.modules.CommentBox = CommentBox;

})();