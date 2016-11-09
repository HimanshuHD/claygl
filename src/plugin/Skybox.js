// TODO Should not derived from mesh?
define(function(require) {

    var Mesh = require('../Mesh');
    var CubeGeometry = require('../geometry/Cube');
    var Shader = require('../Shader');
    var Material = require('../Material');

    var skyboxShader;

    /**
     * @constructor qtek.plugin.Skybox
     *
     * @example
     *     var skyTex = new qtek.TextureCube();
     *     skyTex.load({
     *         'px': 'assets/textures/sky/px.jpg',
     *         'nx': 'assets/textures/sky/nx.jpg'
     *         'py': 'assets/textures/sky/py.jpg'
     *         'ny': 'assets/textures/sky/ny.jpg'
     *         'pz': 'assets/textures/sky/pz.jpg'
     *         'nz': 'assets/textures/sky/nz.jpg'
     *     });
     *     var skybox = new qtek.plugin.Skybox({
     *         scene: scene
     *     });
     *     skybox.material.set('environmentMap', skyTex);
     */
    var Skybox = Mesh.derive(function () {

        if (!skyboxShader) {
            skyboxShader = new Shader({
                vertex: Shader.source('qtek.skybox.vertex'),
                fragment: Shader.source('qtek.skybox.fragment')
            });
        }
        var material = new Material({
            shader: skyboxShader,
            depthMask: false
        });

        return {
            /**
             * @type {qtek.Scene}
             * @memberOf qtek.plugin.Skybox.prototype
             */
            scene: null,

            geometry: new CubeGeometry(),

            material: material,

            environmentMap: null,

            culling: false
        };
    }, function () {
        var scene = this.scene;
        if (scene) {
            this.attachScene(scene);
        }
        if (this.environmentMap) {
            this.setEnvMap(this.environmentMap);
        }
    }, {
        /**
         * Attach the skybox to the scene
         * @param  {qtek.Scene} scene
         * @memberOf qtek.plugin.Skybox.prototype
         */
        attachScene: function (scene) {
            if (this.scene) {
                this.detachScene();
            }
            this.scene = scene;
            scene.on('beforerender', this._beforeRenderScene, this);
        },
        /**
         * Detach from scene
         * @memberOf qtek.plugin.Skybox.prototype
         */
        detachScene: function () {
            if (this.scene) {
                this.scene.off('beforerender', this._beforeRenderScene, this);
            }
            this.scene = null;
        },

        /**
         * Dispose skybox
         * @param  {WebGLRenderingContext} gl
         */
        dispose: function (gl) {
            this.detachScene();
            this.geometry.dispose(gl);
            this.material.dispose(gl);
        },

        setEnvMap: function (envMap) {
            this.material.set('environmentMap', envMap);
        },

        _beforeRenderScene: function(renderer, scene, camera) {
            this.position.copy(camera.getWorldPosition());
            this.update();
            renderer.renderQueue([this], camera);
        }
    });

    return Skybox;
});