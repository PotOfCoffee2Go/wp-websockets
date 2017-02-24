/**
 Functions to position images on marked up document
 Design allows calling functions from javascript or
 Handlebars.

 Handlebars example
 **\{\{\{ image img.pretty_pic '80px' '0 0 0 10px' \}\}\}**

 `img.pretty_pic` is object with the following fields :
 <pre><samp>
 img.pretty_pic = {
   src: url of image,
   href: url if image clicked
   style: optional image style override
 }
 </samp></pre>

 '80px' is the image width (the height is automatic keeping
 to the image aspect ratio). The '0 0 0 10px' is the margin style
 for positioning the image on the document relative to the
 location of the Handlebars entry.

 */

(function (ns) {
    "use strict";
    /** **Handlebars helper to place images on page**

     Images are placed within a div that is position: relative thus
     allowing the image to scroll properly, and float: left as being the
     most commonly used image on left side of the text. To float: right
     place the float:right in the style (see [image.js](../src/image.js))
     Because the containing div is relative, the image itself can be
     styled position: absolute for flexibility of overlaying image
     above/below text.
     */
    function image(pic, width, margin) {
        if (pic == null) return '';
        // Set margin to default when not passed as a parameter
        margin = typeof margin === 'string' ? margin : '0 0 0 0';
        var src = pic.src;
        var ref = pic.href;
        var style = pic.style || '';

        // The right and left margin is assigned to the containing div
        //  while the top and bottom margins are assigned to the image
        var margins = margin.split(' ');
        var divmargin = '0 ' + margins[1] + ' 0 ' + margins[3];
        var imgmargin = margins[0] + ' 0 ' + margins[2] + ' 0';

        // If the style is a float - place float:xxx into the image's parent div
        var divstyle = ['', ''];
        if (/(float:.*;)/.test(style)) {
            divstyle = style.match(/(float:.*;)/i);
        }

        // Create layout for image for placing in the document
        // Important styles of pic-parent-div class are :
        //  { position: relative; float: left; }
        var retval =
            '<div style="margin:' + divmargin + '; width:' + width + ';' + divstyle[1] +
            '" class="pic-parent-div">' +
            '<a href="' + ref + '">' +
            '<img style="margin:' + imgmargin + '; ' +
            'width:' + width + ';' + style + '" src="' + src + '" />' +
            '</a>' +
            '</div>';
        return retval;
    }


    /** **Handlebars helper to place inline images on page**

     In-line images will flow with the text. The only parameter
     is the image width :
     \{\{\{ image-inline '80px' \}\}\}
     */
    function imageInline(pic, width) {
        if (pic == null) return '';
        var src = pic.src;
        var ref = pic.href;
        var style = pic.style || '';

        var retval = '<a href="' + ref + '">' +
            '<img src="' + src + '" style="width:' + width + ';' + style + '" /></a>';

        return retval;
    }

    /// Register the helpers with Handlebars
    /* global Handlebars */
    Handlebars.registerHelper('image', function (pic, width, margin) {
        return new Handlebars.SafeString(image(pic, width, margin));
    });
    Handlebars.registerHelper('image-inline', function (pic, width) {
        return new Handlebars.SafeString(imageInline(pic, width));
    });

    /// Assign functions to the namespace so can also be used by javascript
    ns.hbars = {
        image: image,
        imageInline: imageInline
    };
})(poc2go); /* global poc2go */